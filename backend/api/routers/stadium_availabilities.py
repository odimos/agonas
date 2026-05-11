from typing import List, Optional

from django.shortcuts import get_object_or_404
from ninja import Router

from api.models import Stadium, StadiumAvailability
from api.schema import StadiumAvailabilityIn, StadiumAvailabilityOut

router = Router()


@router.get('/', response=List[StadiumAvailabilityOut])
def list_availabilities(request, stadium_id: Optional[int] = None):
    qs = StadiumAvailability.objects.select_related('stadium')
    if stadium_id is not None:
        qs = qs.filter(stadium_id=stadium_id)
    return list(qs)


@router.post('/', response={201: StadiumAvailabilityOut})
def create_availability(request, stadium_id: int, payload: StadiumAvailabilityIn):
    stadium = get_object_or_404(Stadium, id=stadium_id)
    av = StadiumAvailability(stadium=stadium, **payload.model_dump())
    av.save()
    return 201, av


@router.put('/{av_id}', response=StadiumAvailabilityOut)
def update_availability(request, av_id: int, payload: StadiumAvailabilityIn):
    av = get_object_or_404(StadiumAvailability, id=av_id)
    for attr, value in payload.model_dump().items():
        setattr(av, attr, value)
    av.save()
    return av


@router.delete('/{av_id}', response={204: None})
def delete_availability(request, av_id: int):
    get_object_or_404(StadiumAvailability, id=av_id).delete()
    return 204, None
