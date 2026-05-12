import random
from datetime import date, datetime, timedelta
from typing import List, Optional

from django.shortcuts import get_object_or_404
from ninja import Router, Schema

from api.models import (
    Match, Phase, RefereePreference, StadiumAvailability, TeamPreference,
)

router = Router()


class ScheduleRequest(Schema):
    start_date: date
    end_date: date
    mode: str = 'league'  # 'league' or 'knockout'
    from_scratch: bool = False


class ScheduleSuggestion(Schema):
    match_id: Optional[int] = None   # None = new match to create (knockout bye/pair)
    home_team_id: Optional[int]
    away_team_id: Optional[int]
    stadium_id: int
    stadium_name: str
    scheduled_at: datetime
    score: int
    is_bye: bool = False


class ScheduleResponse(Schema):
    suggestions: List[ScheduleSuggestion]
    unscheduled: List[int]   # existing match ids that couldn't be placed
    new_matches: List[dict]  # knockout: new match specs to create


class ApplyRequest(Schema):
    suggestions: List[ScheduleSuggestion]
    tournament_id: Optional[int] = None
    phase_id_val: Optional[int] = None  # used for new match creation


@router.post('/generate', response=ScheduleResponse)
def generate_schedule(request, phase_id: int, payload: ScheduleRequest):
    phase = get_object_or_404(Phase, id=phase_id)
    phase_team_ids = list(phase.teams.values_list('id', flat=True))

    if payload.from_scratch:
        Match.objects.filter(phase_id=phase.id, status__in=['draft', 'expected']).delete()

    avs = list(StadiumAvailability.objects.select_related('stadium').all())
    slots = _expand_slots(avs, payload.start_date, payload.end_date)

    team_prefs = {}
    for tp in TeamPreference.objects.filter(team_id__in=phase_team_ids):
        team_prefs.setdefault(tp.team_id, {})[tp.availability_id] = tp.score

    if payload.mode == 'knockout':
        return _generate_knockout(phase, phase_team_ids, slots, team_prefs, payload.from_scratch)
    else:
        return _generate_league(phase, phase_team_ids, slots, team_prefs)


# ─── League mode ──────────────────────────────────────────────────────────────

def _generate_league(phase, phase_team_ids, slots, team_prefs):
    matches = list(
        Match.objects.filter(phase_id=phase.id, status__in=['draft', 'expected'])
        .select_related('home_team', 'away_team', 'referee')
    )
    if not matches:
        return {'suggestions': [], 'unscheduled': [], 'new_matches': []}

    ref_ids = [m.referee_id for m in matches if m.referee_id]
    ref_prefs = {}
    for rp in RefereePreference.objects.filter(referee_id__in=ref_ids):
        ref_prefs.setdefault(rp.referee_id, {})[rp.availability_id] = rp.score

    matches_sorted = sorted(matches, key=lambda m: sum(
        1 for sl in slots if _slot_score(m, sl, team_prefs, ref_prefs) >= 0
    ))

    day_teams, day_refs, slot_used = {}, {}, {i: 0 for i in range(len(slots))}
    suggestions, unscheduled = [], []

    for match in matches_sorted:
        best_score, best_idx = -1, None
        for i, sl in enumerate(slots):
            d = sl['dt'].date()
            if match.home_team_id and match.home_team_id in day_teams.get(d, set()):
                continue
            if match.away_team_id and match.away_team_id in day_teams.get(d, set()):
                continue
            if match.referee_id and match.referee_id in day_refs.get(d, set()):
                continue
            if slot_used[i] >= sl['capacity']:
                continue
            score = _slot_score(match, sl, team_prefs, ref_prefs)
            if score > best_score:
                best_score, best_idx = score, i

        if best_idx is not None:
            sl = slots[best_idx]
            d = sl['dt'].date()
            day_teams.setdefault(d, set())
            day_refs.setdefault(d, set())
            if match.home_team_id: day_teams[d].add(match.home_team_id)
            if match.away_team_id: day_teams[d].add(match.away_team_id)
            if match.referee_id:   day_refs[d].add(match.referee_id)
            slot_used[best_idx] += 1
            suggestions.append(ScheduleSuggestion(
                match_id=match.id,
                home_team_id=match.home_team_id,
                away_team_id=match.away_team_id,
                stadium_id=sl['stadium_id'],
                stadium_name=sl['stadium_name'],
                scheduled_at=sl['dt'],
                score=best_score,
                is_bye=False,
            ))
        else:
            unscheduled.append(match.id)

    return {'suggestions': suggestions, 'unscheduled': unscheduled, 'new_matches': []}


# ─── Knockout mode ────────────────────────────────────────────────────────────

def _generate_knockout(phase, phase_team_ids, slots, team_prefs, from_scratch=True):
    # Find teams already paired in existing draft/expected matches
    existing_matches = list(
        Match.objects.filter(phase_id=phase.id, status__in=['draft', 'expected'])
    ) if not from_scratch else []

    already_paired = set()
    for m in existing_matches:
        if m.home_team_id: already_paired.add(m.home_team_id)
        if m.away_team_id: already_paired.add(m.away_team_id)

    teams = [tid for tid in phase_team_ids if tid not in already_paired]
    random.shuffle(teams)

    pairs = []  # (home_id, away_id) or (home_id, None) for bye
    while len(teams) >= 2:
        pairs.append((teams.pop(), teams.pop()))
    if teams:
        pairs.append((teams.pop(), None))  # bye

    day_teams, slot_used = {}, {i: 0 for i in range(len(slots))}
    suggestions, unscheduled_specs = [], []

    for home_id, away_id in pairs:
        is_bye = away_id is None
        best_score, best_idx = -1, None

        for i, sl in enumerate(slots):
            d = sl['dt'].date()
            if home_id and home_id in day_teams.get(d, set()):
                continue
            if away_id and away_id in day_teams.get(d, set()):
                continue
            if slot_used[i] >= sl['capacity']:
                continue
            score = (team_prefs.get(home_id, {}).get(sl['av_id'], 0)
                   + (team_prefs.get(away_id, {}).get(sl['av_id'], 0) if away_id else 0))
            if score > best_score:
                best_score, best_idx = score, i

        if best_idx is not None:
            sl = slots[best_idx]
            d = sl['dt'].date()
            day_teams.setdefault(d, set())
            if home_id: day_teams[d].add(home_id)
            if away_id: day_teams[d].add(away_id)
            slot_used[best_idx] += 1
            suggestions.append(ScheduleSuggestion(
                match_id=None,
                home_team_id=home_id,
                away_team_id=away_id,
                stadium_id=sl['stadium_id'],
                stadium_name=sl['stadium_name'],
                scheduled_at=sl['dt'],
                score=best_score,
                is_bye=is_bye,
            ))
        else:
            unscheduled_specs.append({'home_team_id': home_id, 'away_team_id': away_id})

    return {
        'suggestions': suggestions,
        'unscheduled': [],
        'new_matches': unscheduled_specs,
    }


# ─── Apply ────────────────────────────────────────────────────────────────────

@router.post('/apply', response={200: dict})
def apply_schedule(request, phase_id: int, payload: ApplyRequest):
    phase = get_object_or_404(Phase, id=phase_id)

    applied = 0
    for s in payload.suggestions:
        if s.match_id:
            # Update existing match
            match = get_object_or_404(Match, id=s.match_id)
            match.stadium_id   = s.stadium_id
            match.scheduled_at = s.scheduled_at
            match.status       = 'expected'
            match.save()
            applied += 1
        else:
            # Create new match (knockout)
            Match.objects.create(
                status='expected',
                home_team_id=s.home_team_id,
                away_team_id=s.away_team_id,
                stadium_id=s.stadium_id,
                scheduled_at=s.scheduled_at,
                tournament_id=phase.tournament_id,
                phase_id=phase.id,
            )
            applied += 1

    return {'applied': applied}


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _expand_slots(avs, start_date, end_date):
    slots = []
    current = start_date
    while current <= end_date:
        dow = current.weekday()
        for av in avs:
            if av.day == dow:
                h = int(str(av.start_time)[:2])
                m = int(str(av.start_time)[3:5])
                slots.append({
                    'dt':           datetime(current.year, current.month, current.day, h, m),
                    'stadium_id':   av.stadium_id,
                    'stadium_name': av.stadium.name,
                    'av_id':        av.id,
                    'capacity':     av.quantity,
                })
        current += timedelta(days=1)
    return slots


def _slot_score(match, sl, team_prefs, ref_prefs):
    score = 0
    av_id = sl['av_id']
    if match.home_team_id:
        score += team_prefs.get(match.home_team_id, {}).get(av_id, 0)
    if match.away_team_id:
        score += team_prefs.get(match.away_team_id, {}).get(av_id, 0)
    if match.referee_id:
        score += ref_prefs.get(match.referee_id, {}).get(av_id, 0)
    return score
