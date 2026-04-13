docker compose build ### build images
initialize the db 
docker compose up -- watxh // tart the rest of the project
## build backend docker image
docker compose build backend


docker compose run --rm backend python manage.py makemigrations
docker compose run --rm backend python manage.py migrate

docker compose run --rm -p 8000:8000 backend python manage.py runserver 0.0.0.0:8000

--watch -> automatically rebuilds
docker compose up postgress
docker compose up --watch frontend
docker compose run -rm --no-deps --service-ports --use-aliases backend python manage.py runserver 0.0.0.0:8000

Use this:
docker compose up db
docker compose up --watch frontend
docker compose up --watch --no-deps backend

docker compose up db
docker compose up frontend
docker compose up backend --no-deps