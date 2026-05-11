from typing import List

from django.shortcuts import get_object_or_404
from ninja import Router

from api.models import Stadium
from api.schema import StadiumIn, StadiumOut

router = Router()

ORDER_FIELDS = {'name': 'name', 'created_at': 'created_at'}


@router.get('/', response=List[StadiumOut])
def list_stadiums(request, search: str = '', ordering: str = 'created_at'):
    qs = Stadium.objects.all()
    if search:
        qs = qs.filter(name__icontains=search)
    desc = ordering.startswith('-')
    key = ordering.lstrip('-')
    field = ORDER_FIELDS.get(key, 'created_at')
    qs = qs.order_by(f'-{field}' if desc else field)
    return list(qs)


@router.post('/', response={201: StadiumOut})
def create_stadium(request, payload: StadiumIn):
    stadium = Stadium(**payload.model_dump())
    stadium.save()
    return 201, stadium


@router.get('/{stadium_id}', response=StadiumOut)
def get_stadium(request, stadium_id: int):
    return get_object_or_404(Stadium, id=stadium_id)


@router.put('/{stadium_id}', response=StadiumOut)
def update_stadium(request, stadium_id: int, payload: StadiumIn):
    stadium = get_object_or_404(Stadium, id=stadium_id)
    for attr, value in payload.model_dump().items():
        setattr(stadium, attr, value)
    stadium.save()
    return stadium


@router.delete('/{stadium_id}', response={204: None})
def delete_stadium(request, stadium_id: int):
    stadium = get_object_or_404(Stadium, id=stadium_id)
    stadium.delete()
    return 204, None
