from ninja import NinjaAPI, Schema

from .schema import HelloResponse
from .routers.referees import router as referees_router

api = NinjaAPI()

api.add_router('/referees', referees_router)


@api.get('/', response=HelloResponse)
def index(request):
    return {'message': 'Hello, world.'}


class HelloRequest(Schema):
    name: str