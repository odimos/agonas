from typing import List, Optional

from django.shortcuts import get_object_or_404
from ninja import Router, Schema
from ninja.errors import HttpError
from pydantic import field_validator

from api.models import Team
from userapp.models import AppUser

router = Router()


class UserOut(Schema):
    id: int
    username: str
    bio: str
    player_id: Optional[int]
    referee_id: Optional[int]
    player_name: Optional[str]
    referee_name: Optional[str]
    team_id: Optional[int]
    team_name: Optional[str]
    captain_team_id: Optional[int]
    captain_team_name: Optional[str]
    vice_team_id: Optional[int]
    vice_team_name: Optional[str]
    roles: List[str]
    phone: Optional[str]
    email: Optional[str]


class UserIn(Schema):
    username: str
    password: str
    player_id: Optional[int] = None
    referee_id: Optional[int] = None

    @field_validator('username', 'password')
    @classmethod
    def required(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('This field is required.')
        return v


def _user_out(u: AppUser) -> dict:
    p = u.player
    r = u.referee
    team = p.team if p and p.team_id else None
    captain_team = Team.objects.filter(captain_id=u.player_id).first() if u.player_id else None
    vice_team = Team.objects.filter(vice_captain_id=u.player_id).first() if u.player_id else None

    roles = []
    if u.player_id: roles.append('player')
    if captain_team: roles.append('captain')
    if vice_team: roles.append('vice_captain')
    if u.referee_id: roles.append('referee')

    return {
        'id': u.id,
        'username': u.username,
        'bio': u.bio,
        'player_id': u.player_id,
        'referee_id': u.referee_id,
        'player_name': f'{p.first_name} {p.last_name}' if p else None,
        'referee_name': f'{r.first_name} {r.last_name}' if r else None,
        'team_id': team.id if team else None,
        'team_name': team.name if team else None,
        'captain_team_id': captain_team.id if captain_team else None,
        'captain_team_name': captain_team.name if captain_team else None,
        'vice_team_id': vice_team.id if vice_team else None,
        'vice_team_name': vice_team.name if vice_team else None,
        'roles': roles,
        'phone': (p.phone if p else None) or (r.phone if r else None) or None,
        'email': (p.email if p else None) or (r.email if r else None) or None,
    }


@router.get('/', response=List[UserOut])
def list_users(request):
    qs = AppUser.objects.select_related('player', 'referee').order_by('username')
    return [_user_out(u) for u in qs]


@router.post('/', response={201: UserOut})
def create_user(request, payload: UserIn):
    if AppUser.objects.filter(username=payload.username).exists():
        raise HttpError(400, 'Username already exists')
    if payload.player_id is None and payload.referee_id is None:
        raise HttpError(400, 'Πρέπει να υπάρχει σύνδεση με παίκτη ή/και διαιτητή')
    u = AppUser.objects.create(
        username=payload.username,
        password=payload.password,
        player_id=payload.player_id,
        referee_id=payload.referee_id,
    )
    u = AppUser.objects.select_related('player', 'referee').get(id=u.id)
    return 201, _user_out(u)


class UserUpdateIn(Schema):
    player_id: Optional[int] = None
    referee_id: Optional[int] = None


@router.patch('/{user_id}', response=UserOut)
def update_user(request, user_id: int, payload: UserUpdateIn):
    u = get_object_or_404(AppUser, id=user_id)
    if payload.player_id is None and payload.referee_id is None:
        raise HttpError(400, 'Πρέπει να υπάρχει σύνδεση με παίκτη ή/και διαιτητή')
    u.player_id = payload.player_id
    u.referee_id = payload.referee_id
    u.save()
    u = AppUser.objects.select_related('player', 'referee').get(id=u.id)
    return _user_out(u)


@router.delete('/{user_id}', response={204: None})
def delete_user(request, user_id: int):
    u = get_object_or_404(AppUser, id=user_id)
    u.delete()
    return 204, None
