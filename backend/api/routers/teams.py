from typing import List

from django.shortcuts import get_object_or_404
from ninja import Router

from api.models import Team
from api.schema import TeamIn, TeamOut

router = Router()


@router.get('/', response=List[TeamOut])
def list_teams(request, search: str = ''):
    qs = Team.objects.all()
    if search:
        qs = qs.filter(name__icontains=search)
    return list(qs)


@router.post('/', response={201: TeamOut})
def create_team(request, payload: TeamIn):
    team = Team(**payload.model_dump())
    team.save()
    return 201, team


@router.get('/{team_id}', response=TeamOut)
def get_team(request, team_id: int):
    return get_object_or_404(Team, id=team_id)


@router.put('/{team_id}', response=TeamOut)
def update_team(request, team_id: int, payload: TeamIn):
    team = get_object_or_404(Team, id=team_id)
    for attr, value in payload.model_dump().items():
        setattr(team, attr, value)
    team.save()
    return team


@router.delete('/{team_id}', response={204: None})
def delete_team(request, team_id: int):
    team = get_object_or_404(Team, id=team_id)
    team.delete()
    return 204, None
