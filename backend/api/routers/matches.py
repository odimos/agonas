from typing import List

from django.shortcuts import get_object_or_404
from ninja import Router

from api.models import Match
from api.schema import MatchIn, MatchOut

router = Router()


@router.get('/', response=List[MatchOut])
def list_matches(request, search: str = ''):
    qs = Match.objects.all()
    if search:
        qs = (
            qs.filter(home_team__name__icontains=search)
            | qs.filter(away_team__name__icontains=search)
        )
    return list(qs)


@router.post('/', response={201: MatchOut})
def create_match(request, payload: MatchIn):
    match = Match(**payload.model_dump())
    match.save()
    return 201, match


@router.get('/{match_id}', response=MatchOut)
def get_match(request, match_id: int):
    return get_object_or_404(Match, id=match_id)


@router.put('/{match_id}', response=MatchOut)
def update_match(request, match_id: int, payload: MatchIn):
    match = get_object_or_404(Match, id=match_id)
    for attr, value in payload.model_dump().items():
        setattr(match, attr, value)
    match.save()
    return match


@router.delete('/{match_id}', response={204: None})
def delete_match(request, match_id: int):
    match = get_object_or_404(Match, id=match_id)
    match.delete()
    return 204, None
