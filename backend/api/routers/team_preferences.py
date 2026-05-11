from typing import List

from django.shortcuts import get_object_or_404
from ninja import Router

from api.models import StadiumAvailability, Team, TeamPreference
from api.schema import TeamPreferenceIn, TeamPreferenceOut

router = Router()


@router.get('/', response=List[TeamPreferenceOut])
def list_preferences(request, team_id: int):
    return list(TeamPreference.objects.filter(team_id=team_id))


@router.put('/', response=TeamPreferenceOut)
def upsert_preference(request, team_id: int, payload: TeamPreferenceIn):
    team = get_object_or_404(Team, id=team_id)
    av   = get_object_or_404(StadiumAvailability, id=payload.availability_id)
    pref, _ = TeamPreference.objects.update_or_create(
        team=team, availability=av,
        defaults={'score': payload.score},
    )
    return pref


@router.delete('/{pref_id}', response={204: None})
def delete_preference(request, pref_id: int):
    get_object_or_404(TeamPreference, id=pref_id).delete()
    return 204, None
