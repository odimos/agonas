from typing import List, Optional

from django.db import models, transaction
from ninja import NinjaAPI, Schema
from ninja.errors import HttpError

from api.models import Match, MatchPlayerCard, MatchPlayerGoal, Player, Team, Phase, Tournament
from .models import AppUser

api = NinjaAPI(urls_namespace='userapp')


# ── Auth schemas ────────────────────────────────────────────────────────────

class LoginIn(Schema):
    username: str
    password: str


class MeOut(Schema):
    id: int
    username: str
    bio: str
    is_player: bool
    is_referee: bool
    is_captain: bool
    player_id: Optional[int]
    referee_id: Optional[int]
    team_id: Optional[int]
    team_name: Optional[str]


# ── Match schemas ────────────────────────────────────────────────────────────

class GoalIn(Schema):
    player_id: int
    team_id: int
    minute: int
    own_goal: bool = False


class CardIn(Schema):
    player_id: int
    team_id: int
    minute: int
    card_type: str


class FinishMatchIn(Schema):
    home_score: int
    away_score: int
    home_fair_play: int
    away_fair_play: int
    comments: Optional[str] = None
    goals: List[GoalIn] = []
    cards: List[CardIn] = []


class MatchInfoOut(Schema):
    id: int
    home_team_id: Optional[int]
    away_team_id: Optional[int]
    home_team_name: Optional[str]
    away_team_name: Optional[str]
    scheduled_at: Optional[str]
    tournament_name: Optional[str]
    status: str


class PlayerOut(Schema):
    id: int
    first_name: str
    last_name: str
    team_id: Optional[int]


class RefereeMatchOut(Schema):
    id: int
    home_team_name: Optional[str]
    away_team_name: Optional[str]
    stadium_name: Optional[str]
    scheduled_at: Optional[str]
    status: str


# ── Auth endpoints ───────────────────────────────────────────────────────────

def _me_dict(user: AppUser) -> dict:
    team_id = None
    team_name = None
    if user.player_id and user.player and user.player.team_id:
        team_id = user.player.team_id
        team_name = user.player.team.name if user.player.team else None
    return {
        'id': user.id,
        'username': user.username,
        'bio': user.bio,
        'is_player': user.is_player(),
        'is_referee': user.is_referee(),
        'is_captain': user.is_captain(),
        'player_id': user.player_id,
        'referee_id': user.referee_id,
        'team_id': team_id,
        'team_name': team_name,
    }


@api.post('/auth/login', response=MeOut)
def login(request, payload: LoginIn):
    try:
        user = AppUser.objects.select_related(
            'player', 'player__team', 'referee'
        ).get(username=payload.username)
    except AppUser.DoesNotExist:
        raise HttpError(401, 'Invalid credentials')
    if user.password != payload.password:
        raise HttpError(401, 'Invalid credentials')
    request.session['user_id'] = user.id
    return _me_dict(user)


class BioIn(Schema):
    bio: str


@api.patch('/auth/bio')
def update_bio(request, payload: BioIn):
    user_id = request.session.get('user_id')
    if not user_id:
        raise HttpError(401, 'Not authenticated')
    AppUser.objects.filter(id=user_id).update(bio=payload.bio.strip())
    return {'success': True}


@api.post('/auth/logout')
def logout(request):
    request.session.flush()
    return {'success': True}


@api.get('/auth/me', response=MeOut)
def me(request):
    user_id = request.session.get('user_id')
    if not user_id:
        raise HttpError(401, 'Not authenticated')
    try:
        user = AppUser.objects.select_related(
            'player', 'player__team', 'referee'
        ).get(id=user_id)
    except AppUser.DoesNotExist:
        raise HttpError(401, 'Not authenticated')
    return _me_dict(user)


# ── Referee forms endpoints ──────────────────────────────────────────────────

@api.get('/referee/matches/open', response=List[RefereeMatchOut])
def referee_open_matches(request):
    user_id = request.session.get('user_id')
    if not user_id:
        raise HttpError(401, 'Not authenticated')
    try:
        user = AppUser.objects.get(id=user_id)
    except AppUser.DoesNotExist:
        raise HttpError(401, 'Not authenticated')
    if not user.referee_id:
        raise HttpError(403, 'Not a referee')
    matches = Match.objects.select_related(
        'home_team', 'away_team', 'stadium'
    ).filter(referee_id=user.referee_id, status='expected').order_by('scheduled_at')
    return [
        {
            'id': m.id,
            'home_team_name': m.home_team.name if m.home_team else None,
            'away_team_name': m.away_team.name if m.away_team else None,
            'stadium_name': m.stadium.name if m.stadium else None,
            'scheduled_at': m.scheduled_at.isoformat() if m.scheduled_at else None,
            'status': m.status,
        }
        for m in matches
    ]


@api.get('/referee/matches/submitted', response=List[RefereeMatchOut])
def referee_submitted_matches(request):
    user_id = request.session.get('user_id')
    if not user_id:
        raise HttpError(401, 'Not authenticated')
    try:
        user = AppUser.objects.get(id=user_id)
    except AppUser.DoesNotExist:
        raise HttpError(401, 'Not authenticated')
    if not user.referee_id:
        raise HttpError(403, 'Not a referee')
    matches = Match.objects.select_related(
        'home_team', 'away_team', 'stadium'
    ).filter(referee_id=user.referee_id, status='finished').order_by('-scheduled_at')
    return [
        {
            'id': m.id,
            'home_team_name': m.home_team.name if m.home_team else None,
            'away_team_name': m.away_team.name if m.away_team else None,
            'stadium_name': m.stadium.name if m.stadium else None,
            'scheduled_at': m.scheduled_at.isoformat() if m.scheduled_at else None,
            'status': m.status,
        }
        for m in matches
    ]


# ── Player / Team data endpoints ─────────────────────────────────────────────

@api.get('/referee/me')
def referee_me(request):
    user_id = request.session.get('user_id')
    if not user_id:
        raise HttpError(401, 'Not authenticated')
    user = AppUser.objects.select_related('referee').get(id=user_id)
    if not user.referee_id:
        raise HttpError(403, 'Not a referee')
    r = user.referee
    return {
        'id': r.id,
        'first_name': r.first_name,
        'last_name': r.last_name,
        'phone': r.phone,
        'email': r.email,
    }


@api.get('/player/me')
def player_me(request):
    user_id = request.session.get('user_id')
    if not user_id:
        raise HttpError(401, 'Not authenticated')
    user = AppUser.objects.select_related('player').get(id=user_id)
    if not user.player_id:
        raise HttpError(403, 'Not a player')
    p = user.player
    return {
        'id': p.id,
        'first_name': p.first_name,
        'last_name': p.last_name,
        'nickname': p.nickname,
        'phone': p.phone,
        'email': p.email,
    }


@api.get('/player/goals')
def player_goals(request):
    user_id = request.session.get('user_id')
    if not user_id:
        raise HttpError(401, 'Not authenticated')
    user = AppUser.objects.select_related('player').get(id=user_id)
    if not user.player_id:
        raise HttpError(403, 'Not a player')
    count = MatchPlayerGoal.objects.filter(player_id=user.player_id, own_goal=False).count()
    return {'goals': count}


@api.get('/team/{team_id}/matches')
def team_matches(request, team_id: int):
    try:
        Team.objects.get(id=team_id)
    except Team.DoesNotExist:
        raise HttpError(404, 'Team not found')
    matches = Match.objects.select_related(
        'home_team', 'away_team', 'stadium', 'tournament'
    ).filter(
        status__in=['expected', 'finished']
    ).filter(
        models.Q(home_team_id=team_id) | models.Q(away_team_id=team_id)
    ).order_by('scheduled_at')

    result = []
    for m in matches:
        is_home = m.home_team_id == team_id
        opponent = m.away_team.name if is_home else (m.home_team.name if m.home_team else '?')
        if m.status == 'finished':
            team_score = m.home_score if is_home else m.away_score
            opp_score = m.away_score if is_home else m.home_score
            if team_score > opp_score:
                result_str = 'win'
            elif team_score < opp_score:
                result_str = 'loss'
            else:
                result_str = 'draw'
        else:
            team_score = opp_score = result_str = None
        result.append({
            'id': m.id,
            'status': m.status,
            'is_home': is_home,
            'opponent': opponent,
            'home_team_id': m.home_team_id,
            'away_team_id': m.away_team_id,
            'home_team_name': m.home_team.name if m.home_team else None,
            'away_team_name': m.away_team.name if m.away_team else None,
            'team_score': team_score,
            'opp_score': opp_score,
            'result': result_str,
            'venue': m.stadium.name if m.stadium else None,
            'scheduled_at': m.scheduled_at.isoformat() if m.scheduled_at else None,
            'tournament_name': m.tournament.name if m.tournament else None,
        })
    return result


@api.get('/team/{team_id}/info')
def team_info(request, team_id: int):
    try:
        team = Team.objects.get(id=team_id)
    except Team.DoesNotExist:
        raise HttpError(404, 'Team not found')

    players = list(Player.objects.filter(team_id=team_id).order_by('last_name', 'first_name').values('id', 'first_name', 'last_name', 'nickname'))

    finished = Match.objects.filter(
        status='finished'
    ).filter(
        models.Q(home_team_id=team_id) | models.Q(away_team_id=team_id)
    )
    wins = draws = losses = 0
    for m in finished:
        is_home = m.home_team_id == team_id
        ts = m.home_score if is_home else m.away_score
        os = m.away_score if is_home else m.home_score
        if ts > os: wins += 1
        elif ts < os: losses += 1
        else: draws += 1

    # Tournaments: find phases this team is in
    phases = Phase.objects.filter(teams=team).select_related('tournament').order_by('tournament_id', 'order')
    tournaments = {}
    for ph in phases:
        t = ph.tournament
        if t.id not in tournaments:
            tournaments[t.id] = {
                'id': t.id,
                'name': t.name,
                'type': t.type,
                'phases': [],
            }
        tournaments[t.id]['phases'].append({
            'id': ph.id,
            'order': ph.order,
            'is_open': ph.is_open,
        })

    return {
        'id': team_id,
        'name': team.name,
        'players': players,
        'wins': wins,
        'draws': draws,
        'losses': losses,
        'tournaments': list(tournaments.values()),
    }


@api.get('/players/{player_id}/profile')
def player_profile(request, player_id: int):
    try:
        p = Player.objects.select_related('team').get(id=player_id)
    except Player.DoesNotExist:
        raise HttpError(404, 'Player not found')
    goals = MatchPlayerGoal.objects.filter(player_id=player_id, own_goal=False).count()
    yellow = MatchPlayerCard.objects.filter(player_id=player_id, card_type='yellow').count()
    red = MatchPlayerCard.objects.filter(player_id=player_id, card_type='red').count()
    return {
        'id': p.id,
        'first_name': p.first_name,
        'last_name': p.last_name,
        'nickname': p.nickname,
        'team_id': p.team_id,
        'team_name': p.team.name if p.team else None,
        'goals': goals,
        'yellow_cards': yellow,
        'red_cards': red,
    }


# ── Match endpoints ──────────────────────────────────────────────────────────

@api.get('/matches/{match_id}', response=MatchInfoOut)
def get_match(request, match_id: int):
    try:
        m = Match.objects.select_related('home_team', 'away_team', 'tournament').get(id=match_id)
    except Match.DoesNotExist:
        raise HttpError(404, 'Match not found')
    return {
        'id': m.id,
        'home_team_id': m.home_team_id,
        'away_team_id': m.away_team_id,
        'home_team_name': m.home_team.name if m.home_team else None,
        'away_team_name': m.away_team.name if m.away_team else None,
        'scheduled_at': m.scheduled_at.isoformat() if m.scheduled_at else None,
        'tournament_name': m.tournament.name if m.tournament else None,
        'status': m.status,
    }


@api.get('/matches/{match_id}/players', response=List[PlayerOut])
def get_match_players(request, match_id: int):
    try:
        m = Match.objects.get(id=match_id)
    except Match.DoesNotExist:
        raise HttpError(404, 'Match not found')
    team_ids = [tid for tid in [m.home_team_id, m.away_team_id] if tid is not None]
    players = Player.objects.filter(team_id__in=team_ids).order_by('last_name', 'first_name')
    return list(players)


@api.post('/matches/{match_id}/finish')
def finish_match(request, match_id: int, payload: FinishMatchIn):
    try:
        m = Match.objects.select_related('home_team', 'away_team').get(id=match_id)
    except Match.DoesNotExist:
        raise HttpError(404, 'Match not found')

    if m.status != 'expected':
        raise HttpError(400, f"Match status is '{m.status}', expected 'expected'")

    if payload.home_score < 0 or payload.away_score < 0:
        raise HttpError(422, 'Scores must be >= 0')
    if not (-5 <= payload.home_fair_play <= 5) or not (-5 <= payload.away_fair_play <= 5):
        raise HttpError(422, 'Fair play must be between -5 and 5')
    for c in payload.cards:
        if c.card_type not in ('yellow', 'red'):
            raise HttpError(422, 'card_type must be yellow or red')

    with transaction.atomic():
        m.status = 'finished'
        m.home_score = payload.home_score
        m.away_score = payload.away_score
        m.home_fair_play = payload.home_fair_play
        m.away_fair_play = payload.away_fair_play
        if payload.comments is not None:
            m.comments = payload.comments.strip() or None
        m.save()

        for g in payload.goals:
            MatchPlayerGoal.objects.create(
                match=m, player_id=g.player_id, team_id=g.team_id,
                minute=g.minute, own_goal=g.own_goal,
            )
        for c in payload.cards:
            MatchPlayerCard.objects.create(
                match=m, player_id=c.player_id, team_id=c.team_id,
                minute=c.minute, card_type=c.card_type,
            )

    return {'success': True, 'match_id': m.id}
