from ninja import NinjaAPI, Schema

from .schema import HelloResponse
from .routers.players import router as players_router
from .routers.referees import router as referees_router
from .routers.stadiums import router as stadiums_router

api = NinjaAPI()

api.add_router('/referees', referees_router)
api.add_router('/stadiums', stadiums_router)
api.add_router('/players', players_router)


@api.get('/', response=HelloResponse)
def index(request):
    return {'message': 'Hello, world.'}


class HelloRequest(Schema):
    name: str