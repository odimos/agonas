# Agonas — Architecture Reference

## Overview

Agonas is a football league management system with two distinct frontends sharing a single Django + PostgreSQL backend.

| Surface | Purpose | Port |
|---|---|---|
| Management UI | Admin CRUD for league data | 5173 |
| User App | Player-facing mobile-style app | 5174 |
| Django API | REST backend for both | 8000 |
| PostgreSQL | Single shared database | 5432 |

---

## Repository Layout

```
agonas/
├── backend/               # Django project
│   ├── config/            # Project-level settings, urls, wsgi
│   ├── api/               # Management API app
│   │   ├── models.py      # All DB models
│   │   ├── schema.py      # Pydantic request/response schemas
│   │   ├── views.py       # NinjaAPI instance + router registration
│   │   ├── routers/       # One file per entity (CRUD handlers)
│   │   └── migrations/
│   └── userapp/           # User-facing API app
│       ├── views.py
│       └── urls.py
├── frontend/              # Management React app (Vite, port 5173)
│   ├── src/
│   │   ├── App.jsx        # Root — currently renders Theme mockup
│   │   ├── pages/         # One page per entity
│   │   ├── components/    # Modal components per entity
│   │   └── api/           # Fetch wrappers per entity
│   └── mockup/            # Static HTML/JSX design prototypes
├── userapp/               # User-facing React app (Vite, port 5174)
│   └── src/
│       ├── App.jsx
│       └── main.jsx
└── docker-compose.yml
```

---

## Backend

### Framework

**Django 5.2** + **Django Ninja 1.6** (lightweight REST framework using Pydantic for schema validation). No DRF.

### URL Namespaces

```
/admin/           → Django admin
/api/             → Management API  (api app)
/app/             → User App API    (userapp app)
```

### Data Models (`backend/api/models.py`)

All models strip whitespace in `.save()`. Foreign keys use `on_delete=SET_NULL`.

| Model | Key Fields | Relations |
|---|---|---|
| **Team** | name, is_active, comments | captain → Player, vice_captain → Player |
| **Stadium** | name, phone, email, cost, address, map_url | — |
| **Referee** | first_name, last_name, phone, email | — |
| **Player** | first_name, last_name, nickname, phone, email | team → Team |
| **Tournament** | name | — |
| **Match** | status, home_score, away_score, home_fair_play, away_fair_play, scheduled_at, comments | home_team/away_team → Team, referee → Referee, stadium → Stadium, tournament → Tournament |
| **MatchPlayerCard** | card_type (yellow/red), minute, comments | player → Player, match → Match, team → Team |
| **MatchPlayerGoal** | own_goal, minute | player → Player, match → Match, team → Team |

### Match Status Lifecycle

```
draft → expected → finished
              └──→ canceled
```

Validation rules enforced in Pydantic schemas:
- `expected`: requires home_team, away_team, referee, stadium, scheduled_at
- `finished`: all of the above + home_score, away_score, home_fair_play, away_fair_play (-5 to 5)

### API Routers (`backend/api/routers/`)

Each entity gets its own file. All follow this CRUD pattern:

```
GET    /api/{entity}/        list (optional ?search=)
POST   /api/{entity}/        create → 201
GET    /api/{entity}/{id}    retrieve
PUT    /api/{entity}/{id}    update
DELETE /api/{entity}/{id}    delete → 204
```

Cards and Goals are exceptions — no update endpoint, filtered by `?match_id=`.

| Router file | Prefix |
|---|---|
| referees.py | `/api/referees/` |
| stadiums.py | `/api/stadiums/` |
| players.py | `/api/players/` |
| teams.py | `/api/teams/` |
| matches.py | `/api/matches/` |
| match_player_cards.py | `/api/match-player-cards/` |
| match_player_goals.py | `/api/match-player-goals/` |

### Search

Server-side `icontains` filtering. Search fields per entity:
- **Players**: first_name, last_name, nickname
- **Referees**: first_name, last_name
- **Matches**: home_team__name, away_team__name
- **Stadiums / Teams**: name

### Settings notes

- `DEBUG = True`, `ALLOWED_HOSTS = ["*"]`, `CORS_ALLOW_ALL_ORIGINS = True` — dev only
- DB credentials come from `.env` via `os.getenv()`
- No authentication configured yet on either app

---

## Management Frontend (`frontend/`)

### Stack

React 19 · React Router 7 · Vite 8 · No UI library (inline styles / custom CSS)

### State & Data Flow

Each page manages its own state. Pattern per page:

```
Page
 ├── fetch on mount → data[]
 ├── search input → re-fetch with ?search=
 ├── modalType string drives which modal is open
 └── afterSave() → re-fetch to refresh table
```

### Page → API mapping

| Page | API module | Entity |
|---|---|---|
| PlayersPage | `api/players.js` | `/api/players/` |
| RefereesPage | `api/referees.js` | `/api/referees/` |
| StadiumsPage | `api/stadiums.js` | `/api/stadiums/` |
| TeamsPage | `api/teams.js` | `/api/teams/` |
| MatchesPage | `api/matches.js` | `/api/matches/` |

Cards and goals are sub-resources inside MatchesPage, using `api/match_player_cards.js` and `api/match_player_goals.js`.

### Component Structure

```
components/
  {entity}/
    Add{Entity}Modal.jsx      create form
    Details{Entity}Modal.jsx  read-only view + Edit / Delete buttons
    Edit{Entity}Modal.jsx     update form
    Delete{Entity}Modal.jsx   confirm dialog
  Modal.jsx                   base modal wrapper
```

22 modal components total (4 per entity × 5 entities + base + referees extra).

### API Client Layer (`frontend/src/api/`)

All files use `VITE_API_URL` env var as base. Each exposes:

```js
fetchAll(search?)   → GET /api/{entity}/
create(data)        → POST
update(id, data)    → PUT
remove(id)          → DELETE
```

Errors throw the parsed JSON error body.

### Routing

React Router is wired up but currently `App.jsx` renders only the `Theme` mockup component. Pages are imported but not yet routed. Migration from mockup to full routing is in progress.

### Vite Config

No proxy — relies on `VITE_API_URL` in `.env`. `usePolling: true` set for Docker file-watching on Windows.

---

## User App (`userapp/`)

### Status

Barebone scaffold — Hello World screen only. Intended for the player-facing mobile experience (see `frontend/mockup/` for design prototypes of user.html, calendar.html, TeamAppView.html).

### Stack

React 18 · Vite 5 · Port 5174

### Vite proxy

```js
'/app/api' → http://backend:8000
```

All user-facing API calls will go under `/app/api/` on the Django side.

---

## Docker Compose

```yaml
db:        postgres:15       port 5432   volume: db_data
backend:   ./backend         port 8000   volume: ./backend:/app
frontend:  ./frontend        port 5173   volume: ./frontend:/app
userapp:   ./userapp         port 5174   volume: ./userapp:/app
```

- `backend` depends on `db` (healthcheck: `pg_isready`)
- `frontend` and `userapp` depend on `backend`
- Hot reload via volume mounts on all three app containers
- `node_modules` excluded from host volume via anonymous volume trick

---

## Key Patterns & Conventions

- **No authentication yet** on either API namespace — planned separately for `userapp`
- **Mockup-first design**: `frontend/mockup/` contains standalone HTML prototypes used to design screens before implementing them in React
- **Django Ninja over DRF**: lighter, Pydantic-native, no serializer class boilerplate
- **One router file per entity**: keeps routers small and independently testable
- **Test structure**: `backend/api/tests/{unit,integration,functional,smoke}` — Playwright for frontend E2E
- **`.env` at root**: shared by all services via `env_file` in docker-compose
