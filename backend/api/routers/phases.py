from typing import List

from django.shortcuts import get_object_or_404
from ninja import Router
from ninja.errors import HttpError

from api.models import Phase, Team, Tournament
from api.schema import PhaseIn, PhaseOut

router = Router()


@router.get('/', response=List[PhaseOut])
def list_phases(request, tournament_id: int = None):
    qs = Phase.objects.prefetch_related('teams')
    if tournament_id is not None:
        qs = qs.filter(tournament_id=tournament_id)
    return list(qs)


@router.post('/', response={201: PhaseOut})
def create_phase(request, tournament_id: int, payload: PhaseIn):
    tournament = get_object_or_404(Tournament, id=tournament_id)
    phase = Phase(tournament=tournament, order=payload.order, is_open=payload.is_open)
    phase.save()
    if payload.team_ids:
        phase.teams.set(Team.objects.filter(id__in=payload.team_ids))
    return 201, phase


@router.get('/{phase_id}', response=PhaseOut)
def get_phase(request, phase_id: int):
    return get_object_or_404(Phase.objects.prefetch_related('teams'), id=phase_id)


@router.put('/{phase_id}', response=PhaseOut)
def update_phase(request, phase_id: int, payload: PhaseIn):
    phase = get_object_or_404(Phase.objects.prefetch_related('teams'), id=phase_id)

    # A phase cannot be closed if the previous phase is still open
    if not payload.is_open and phase.is_open:
        prev = Phase.objects.filter(
            tournament_id=phase.tournament_id,
            order__lt=phase.order,
            is_open=True,
        ).exists()
        if prev:
            raise HttpError(400, 'Cannot close this phase while a previous phase is still open.')

    phase.order = payload.order
    phase.is_open = payload.is_open
    phase.save()
    phase.teams.set(Team.objects.filter(id__in=payload.team_ids))
    return phase


@router.delete('/{phase_id}', response={204: None})
def delete_phase(request, phase_id: int):
    get_object_or_404(Phase, id=phase_id).delete()
    return 204, None
