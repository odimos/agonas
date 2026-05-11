from typing import List

from django.shortcuts import get_object_or_404
from ninja import Router

from api.models import Tournament
from api.schema import TournamentIn, TournamentOut

router = Router()


@router.get('/', response=List[TournamentOut])
def list_tournaments(request):
    return list(Tournament.objects.order_by('name'))


@router.post('/', response={201: TournamentOut})
def create_tournament(request, payload: TournamentIn):
    t = Tournament.objects.create(**payload.model_dump())
    return 201, t


@router.get('/{tournament_id}', response=TournamentOut)
def get_tournament(request, tournament_id: int):
    return get_object_or_404(Tournament, id=tournament_id)


@router.put('/{tournament_id}', response=TournamentOut)
def update_tournament(request, tournament_id: int, payload: TournamentIn):
    t = get_object_or_404(Tournament, id=tournament_id)
    for attr, value in payload.model_dump().items():
        setattr(t, attr, value)
    t.save()
    return t


@router.delete('/{tournament_id}', response={204: None})
def delete_tournament(request, tournament_id: int):
    get_object_or_404(Tournament, id=tournament_id).delete()
    return 204, None
