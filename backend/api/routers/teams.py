from typing import List

from django.conf import settings
from django.shortcuts import get_object_or_404
from ninja import Router, File
from ninja.files import UploadedFile

from api.models import Team
from api.schema import TeamIn, TeamOut

router = Router()


TEAM_ORDER_FIELDS = {'name': 'name', 'created_at': 'created_at'}


def _media_url(file_field):
    if not file_field:
        return None
    return f"{settings.PUBLIC_BASE_URL}{file_field.url}"


def _team_out(team: Team) -> dict:
    photo_url = _media_url(team.photo)
    return {
        'id': team.id,
        'name': team.name,
        'is_active': team.is_active,
        'comments': team.comments,
        'captain_id': team.captain_id,
        'vice_captain_id': team.vice_captain_id,
        'photo_url': photo_url,
        'created_at': team.created_at,
    }


@router.get('/', response=List[TeamOut])
def list_teams(request, search: str = '', ordering: str = 'created_at'):
    qs = Team.objects.all()
    if search:
        qs = qs.filter(name__icontains=search)
    desc = ordering.startswith('-')
    key = ordering.lstrip('-')
    field = TEAM_ORDER_FIELDS.get(key, 'created_at')
    qs = qs.order_by(f'-{field}' if desc else field)
    return [_team_out(t) for t in qs]


@router.post('/', response={201: TeamOut})
def create_team(request, payload: TeamIn):
    team = Team(**payload.model_dump())
    team.save()
    return 201, _team_out(team)


@router.get('/{team_id}', response=TeamOut)
def get_team(request, team_id: int):
    return _team_out(get_object_or_404(Team, id=team_id), request)


@router.put('/{team_id}', response=TeamOut)
def update_team(request, team_id: int, payload: TeamIn):
    team = get_object_or_404(Team, id=team_id)
    for attr, value in payload.model_dump().items():
        setattr(team, attr, value)
    team.save()
    return _team_out(team)


@router.delete('/{team_id}', response={204: None})
def delete_team(request, team_id: int):
    team = get_object_or_404(Team, id=team_id)
    team.delete()
    return 204, None


@router.post('/{team_id}/photo', response=TeamOut)
def upload_team_photo(request, team_id: int, photo: UploadedFile = File(...)):
    team = get_object_or_404(Team, id=team_id)
    if team.photo:
        team.photo.delete(save=False)
    team.photo.save(f'{team_id}.{photo.name.rsplit(".", 1)[-1]}', photo, save=True)
    return _team_out(team)
