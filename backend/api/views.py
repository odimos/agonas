from ninja import NinjaAPI, Schema
from ninja.errors import HttpError

from .schema import HelloResponse

ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'agonas2026'
from .routers.players import router as players_router
from .routers.tournaments import router as tournaments_router
from .routers.phases import router as phases_router
from .routers.referees import router as referees_router
from .routers.stadiums import router as stadiums_router
from .routers.teams import router as teams_router
from .routers.matches import router as matches_router
from .routers.match_player_cards import router as match_player_cards_router
from .routers.match_player_goals import router as match_player_goals_router
from .routers.stadium_availabilities import router as stadium_availabilities_router
from .routers.team_preferences import router as team_preferences_router
from .routers.referee_preferences import router as referee_preferences_router
from .routers.schedule import router as schedule_router
from .routers.users import router as users_router

api = NinjaAPI()

api.add_router('/referees', referees_router)
api.add_router('/tournaments', tournaments_router)
api.add_router('/phases', phases_router)
api.add_router('/stadiums', stadiums_router)
api.add_router('/players', players_router)
api.add_router('/teams', teams_router)
api.add_router('/matches', matches_router)
api.add_router('/match-player-cards', match_player_cards_router)
api.add_router('/match-player-goals', match_player_goals_router)
api.add_router('/stadium-availabilities', stadium_availabilities_router)
api.add_router('/team-preferences', team_preferences_router)
api.add_router('/referee-preferences', referee_preferences_router)
api.add_router('/schedule', schedule_router)
api.add_router('/users', users_router)


class AdminLoginIn(Schema):
    username: str
    password: str


@api.post('/auth/login')
def admin_login(request, payload: AdminLoginIn):
    if payload.username != ADMIN_USERNAME or payload.password != ADMIN_PASSWORD:
        raise HttpError(401, 'Invalid credentials')
    request.session['admin'] = True
    return {'success': True}


@api.post('/auth/logout')
def admin_logout(request):
    request.session.flush()
    return {'success': True}


@api.get('/auth/me')
def admin_me(request):
    if not request.session.get('admin'):
        raise HttpError(401, 'Not authenticated')
    return {'username': ADMIN_USERNAME}


@api.get('/', response=HelloResponse)
def index(request):
    return {'message': 'Hello, world.'}


class HelloRequest(Schema):
    name: str