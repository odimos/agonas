# Agonas - League Management System

Football tournament management platform that replaces every Excel sheet, group chat, and time-consuming manual process.
It brings match scheduling, result reporting, and team management into a single system, making life easier for referees and organizers.

**Stack**: Django + Django Ninja, React + Vite, PostgreSQL, Docker Compose.


## Architecture
Postgres database, Django REST backend, two separate React frontends. The two frontends serve different purposes (league admin and app user) with different permissions, each with its own API (`/api/` for admin, `/app/api/` for the user app) on the same backend. All services orchestrated with Docker Compose.

![alt text](arch_dev.png "arch")

| Component  | Purpose | Port |
|---|---|---|
| Management Frontend | Dashboard for organizers (managing teams, matches, scores, ..) | 5173 |
| User App Frontend | Public-facing app for users (browsing, referee forms, ..) | 5174 |
| Django backend | REST API, auth, business logic, media uploads | 8000 |
| PostgreSQL | Persists all match/team/referee data | 5432 |

**Auth**: Session-based, admin sign-in via `/api/auth/`, app users via `/app/api/auth/`.

**Core entities**:
    For the admin panel: Team, Player, Referee, Stadium, Match, Tournament/Phase.
    For the user app: App User

**Docker**: Each service has its own Dockerfile (`backend/`, `frontend/`, `userapp/`); `docker-compose.yml` combines them.

## build backend docker image
docker compose build backend


docker compose run --rm backend python manage.py makemigrations
docker compose run --rm backend python manage.py migrate

docker compose run --rm -p 8000:8000 backend python manage.py runserver 0.0.0.0:8000

--watch -> automatically rebuilds
docker compose up postgress
docker compose up --watch frontend
docker compose run -rm --no-deps --service-ports --use-aliases backend python manage.py runserver 0.0.0.0:8000


docker compose up db
docker compose up --watch frontend
docker compose up --watch --no-deps backend

### Use this for dev work:
```bash
docker compose up db
docker compose up frontend
docker compose up backend --no-deps
```
---


## Setup

Must be installed: Docker + Docker Compose, Git.

1. Clone the project:
   ```bash
   git clone https://github.com/odimos/agonas.git
   cd agonas
   ```

2. Create the two `.env` files and fill them in.

   `./.env` (project root, for Postgres + backend):
   ```env
   POSTGRES_DB=<your_db_name>
   POSTGRES_USER=<your_db_user>
   POSTGRES_PASSWORD=<your_db_password>
   POSTGRES_HOST=db
   POSTGRES_PORT=5432
   ```

   `./frontend/.env` (for the management frontend):
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

3. Build images:
   ```bash
   docker compose build
   ```

4. Initialize the database:
   ```bash
   docker compose up db
   docker compose run --rm backend python manage.py makemigrations
   docker compose run --rm backend python manage.py migrate
   ```

5. Start the stack (in separate terminals, for dev work):
   ```bash
   docker compose up db
   docker compose up frontend
   docker compose up backend --no-deps
   ```

Services:
- backend (Django) → http://localhost:8000
- frontend (admin/dashboard) → http://localhost:5173
- userapp → http://localhost:5174
- db (Postgres 15) → localhost:5432
