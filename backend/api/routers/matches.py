from typing import List, Optional

from django.shortcuts import get_object_or_404
from ninja import Router

from api.models import Match
from api.schema import MatchIn, MatchOut

router = Router()


@router.get('/', response=List[MatchOut])
def list_matches(
    request,
    search: str = '',
    status: Optional[str] = None,
    scheduled_from: Optional[str] = None,
    scheduled_to: Optional[str] = None,
    phase_id: Optional[int] = None,
):
    qs = Match.objects.select_related(
        'home_team', 'away_team', 'referee', 'stadium', 'tournament'
    ).order_by('scheduled_at', 'id')

    if search:
        qs = (
            qs.filter(home_team__name__icontains=search)
            | qs.filter(away_team__name__icontains=search)
        )
    if status:
        qs = qs.filter(status=status)
    if scheduled_from:
        qs = qs.filter(scheduled_at__date__gte=scheduled_from)
    if scheduled_to:
        qs = qs.filter(scheduled_at__date__lte=scheduled_to)
    if phase_id is not None:
        qs = qs.filter(phase_id=phase_id)

    return list(qs)


@router.post('/', response={201: MatchOut})
def create_match(request, payload: MatchIn):
    data = payload.model_dump()
    if not data.get('tournament_id'):
        data['phase_id'] = None
    match = Match(**data)
    match.save()
    return 201, match


@router.get('/{match_id}', response=MatchOut)
def get_match(request, match_id: int):
    return get_object_or_404(Match, id=match_id)


@router.put('/{match_id}', response=MatchOut)
def update_match(request, match_id: int, payload: MatchIn):
    data = payload.model_dump()
    if not data.get('tournament_id'):
        data['phase_id'] = None
    match = get_object_or_404(Match, id=match_id)
    for attr, value in data.items():
        setattr(match, attr, value)
    match.save()
    return match


@router.delete('/{match_id}', response={204: None})
def delete_match(request, match_id: int):
    match = get_object_or_404(Match, id=match_id)
    match.delete()
    return 204, None
