from typing import List

from django.shortcuts import get_object_or_404
from ninja import Router

from api.models import Player
from api.schema import PlayerIn, PlayerOut

router = Router()


PLAYER_ORDER_FIELDS = {'name': 'first_name', 'created_at': 'created_at'}

@router.get('/', response=List[PlayerOut])
def list_players(request, search: str = '', team_id: int = None, ordering: str = 'created_at'):
    qs = Player.objects.all()
    if search:
        qs = qs.filter(first_name__icontains=search) | qs.filter(last_name__icontains=search)
    if team_id is not None:
        qs = qs.filter(team_id=team_id)
    desc = ordering.startswith('-')
    key = ordering.lstrip('-')
    field = PLAYER_ORDER_FIELDS.get(key, 'created_at')
    qs = qs.order_by(f'-{field}' if desc else field)
    return list(qs)


@router.post('/', response={201: PlayerOut})
def create_player(request, payload: PlayerIn):
    player = Player(**payload.model_dump())
    player.save()
    return 201, player


@router.get('/{player_id}', response=PlayerOut)
def get_player(request, player_id: int):
    return get_object_or_404(Player, id=player_id)


@router.put('/{player_id}', response=PlayerOut)
def update_player(request, player_id: int, payload: PlayerIn):
    player = get_object_or_404(Player, id=player_id)
    for attr, value in payload.model_dump().items():
        setattr(player, attr, value)
    player.save()
    return player


@router.delete('/{player_id}', response={204: None})
def delete_player(request, player_id: int):
    player = get_object_or_404(Player, id=player_id)
    player.delete()
    return 204, None
