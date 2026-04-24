from ninja import NinjaAPI, Schema

from .schema import HelloResponse
from .routers.players import router as players_router
from .routers.referees import router as referees_router
from .routers.stadiums import router as stadiums_router
from .routers.teams import router as teams_router
from .routers.matches import router as matches_router
from .routers.match_player_cards import router as match_player_cards_router
from .routers.match_player_goals import router as match_player_goals_router

api = NinjaAPI()

api.add_router('/referees', referees_router)
api.add_router('/stadiums', stadiums_router)
api.add_router('/players', players_router)
api.add_router('/teams', teams_router)
api.add_router('/matches', matches_router)
api.add_router('/match-player-cards', match_player_cards_router)
api.add_router('/match-player-goals', match_player_goals_router)


@api.get('/', response=HelloResponse)
def index(request):
    return {'message': 'Hello, world.'}


class HelloRequest(Schema):
    name: str