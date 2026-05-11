from typing import List

from django.shortcuts import get_object_or_404
from ninja import Router

from api.models import Referee, RefereePreference, StadiumAvailability
from api.schema import RefereePreferenceIn, RefereePreferenceOut

router = Router()


@router.get('/', response=List[RefereePreferenceOut])
def list_preferences(request, referee_id: int):
    return list(RefereePreference.objects.filter(referee_id=referee_id))


@router.put('/', response=RefereePreferenceOut)
def upsert_preference(request, referee_id: int, payload: RefereePreferenceIn):
    referee = get_object_or_404(Referee, id=referee_id)
    av      = get_object_or_404(StadiumAvailability, id=payload.availability_id)
    pref, _ = RefereePreference.objects.update_or_create(
        referee=referee, availability=av,
        defaults={'score': payload.score},
    )
    return pref


@router.delete('/{pref_id}', response={204: None})
def delete_preference(request, pref_id: int):
    get_object_or_404(RefereePreference, id=pref_id).delete()
    return 204, None
