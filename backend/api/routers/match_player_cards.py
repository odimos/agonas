from typing import List

from django.shortcuts import get_object_or_404
from ninja import Router
from ninja.errors import HttpError

from api.models import Match, MatchPlayerCard, Player, Team
from api.schema import MatchPlayerCardIn, MatchPlayerCardOut

router = Router()


@router.get('/', response=List[MatchPlayerCardOut])
def list_match_player_cards(request, match_id: int = None):
    qs = MatchPlayerCard.objects.all()
    if match_id is not None:
        qs = qs.filter(match_id=match_id)
    return list(qs)


@router.post('/', response={201: MatchPlayerCardOut})
def create_match_player_card(request, payload: MatchPlayerCardIn):
    match = get_object_or_404(Match, id=payload.match_id)
    team = get_object_or_404(Team, id=payload.team_id)
    player = get_object_or_404(Player, id=payload.player_id)

    match_team_ids = set(filter(None, [match.home_team_id, match.away_team_id]))
    if team.id not in match_team_ids:
        raise HttpError(422, 'Team must be one of the match teams')

    if player.team_id != team.id:
        raise HttpError(422, 'Player must belong to the specified team')

    card = MatchPlayerCard(**payload.model_dump())
    card.save()
    return 201, card


@router.delete('/{card_id}', response={204: None})
def delete_match_player_card(request, card_id: int):
    card = get_object_or_404(MatchPlayerCard, id=card_id)
    card.delete()
    return 204, None
