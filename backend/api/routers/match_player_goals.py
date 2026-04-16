from typing import List

from django.shortcuts import get_object_or_404
from ninja import Router
from ninja.errors import HttpError

from api.models import Match, MatchPlayerGoal, Player, Team
from api.schema import MatchPlayerGoalIn, MatchPlayerGoalOut

router = Router()


@router.get('/', response=List[MatchPlayerGoalOut])
def list_match_player_goals(request, match_id: int = None):
    qs = MatchPlayerGoal.objects.all()
    if match_id is not None:
        qs = qs.filter(match_id=match_id)
    return list(qs)


@router.post('/', response={201: MatchPlayerGoalOut})
def create_match_player_goal(request, payload: MatchPlayerGoalIn):
    match = get_object_or_404(Match, id=payload.match_id)
    team = get_object_or_404(Team, id=payload.team_id)
    player = get_object_or_404(Player, id=payload.player_id)

    match_team_ids = set(filter(None, [match.home_team_id, match.away_team_id]))
    if team.id not in match_team_ids:
        raise HttpError(422, 'Team must be one of the match teams')

    if player.team_id != team.id:
        raise HttpError(422, 'Player must belong to the specified team')

    goal = MatchPlayerGoal(**payload.model_dump())
    goal.save()
    return 201, goal


@router.delete('/{goal_id}', response={204: None})
def delete_match_player_goal(request, goal_id: int):
    goal = get_object_or_404(MatchPlayerGoal, id=goal_id)
    goal.delete()
    return 204, None
