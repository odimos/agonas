from typing import List

from django.shortcuts import get_object_or_404
from ninja import Router

from api.models import Referee
from api.schema import RefereeIn, RefereeOut

router = Router()


@router.get('/', response=List[RefereeOut])
def list_referees(request, search: str = ''):
    print("List api")
    qs = Referee.objects.all()
    if search:
        qs = qs.filter(first_name__icontains=search) | qs.filter(last_name__icontains=search)
    return list(qs)


@router.post('/', response={201: RefereeOut})
def create_referee(request, payload: RefereeIn):
    referee = Referee(**payload.model_dump())
    referee.save()
    return 201, referee


@router.get('/{referee_id}', response=RefereeOut)
def get_referee(request, referee_id: int):
    return get_object_or_404(Referee, id=referee_id)


@router.put('/{referee_id}', response=RefereeOut)
def update_referee(request, referee_id: int, payload: RefereeIn):
    referee = get_object_or_404(Referee, id=referee_id)
    for attr, value in payload.model_dump().items():
        setattr(referee, attr, value)
    referee.save()
    return referee


@router.delete('/{referee_id}', response={204: None})
def delete_referee(request, referee_id: int):
    referee = get_object_or_404(Referee, id=referee_id)
    referee.delete()
    return 204, None
