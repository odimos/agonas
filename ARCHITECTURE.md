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
│   │   ├── App.jsx        # Root — renders Theme (router entry point)
│   │   ├── Theme.jsx      # Top-level layout + React Router routes
│   │   ├── Header.jsx     # Sticky nav bar with language switcher
│   │   ├── SideMenu.jsx   # Entities sidebar (fixed, 16rem)
│   │   ├── Dashboard.jsx  # Match schedule page
│   │   ├── Entities.jsx   # Entities layout (Outlet + SideMenu)
│   │   ├── Teams.jsx / Players.jsx / Referees.jsx / Stadiums.jsx / Requests.jsx
│   │   ├── Tournament.jsx / TournamentOverview.jsx / TournamentSideMenu.jsx / Phase.jsx
│   │   ├── Buttons.jsx / DataTable.jsx / ItemModal.jsx / CreateModal.jsx / ModalField.jsx
│   │   ├── *ModalContent.jsx  # Per-entity modal field sets
│   │   ├── LangContext.jsx    # React context for GR/EN language
│   │   ├── i18n.js            # Translation strings (gr + en)
│   │   ├── styles.js          # Shared design tokens (colors, fonts, radius)
│   │   └── api/               # Fetch wrappers per entity
│   └── mockup/            # Static HTML design prototypes (reference only)
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

### Routing

`App.jsx` renders `<Theme />`, which owns all React Router `<Routes>`:

```
/                   → redirect to /dashboard
/dashboard          → Dashboard
/tournaments        → Tournament (layout)
  /:id             → TournamentOverview
  /:id/phases/:pid → Phase
/entities           → Entities (layout with SideMenu)
  /teams           → Teams
  /players         → Players
  /referees        → Referees
  /stadiums        → Stadiums
  /requests        → Requests
/page               → Stats
```

### Component Structure

All components live flat in `frontend/src/` (no subdirectories):

| File | Role |
|---|---|
| `Theme.jsx` | Router layout shell (wrapper + Header + Routes) |
| `Header.jsx` | Fixed top nav with language toggle |
| `SideMenu.jsx` | Fixed left sidebar for Entities section |
| `Dashboard.jsx` | Match schedule with filters, conflict detection |
| `Entities.jsx` | Layout wrapper with `<Outlet>` for entity sub-pages |
| `Teams/Players/Referees/Stadiums/Requests.jsx` | Entity list pages |
| `Tournament/TournamentOverview/TournamentSideMenu/Phase.jsx` | Tournament management |
| `DataTable.jsx` | Reusable sortable/searchable table |
| `ItemModal.jsx` | View/edit/delete modal shell |
| `CreateModal.jsx` | Create modal shell |
| `ModalField.jsx` | Form field primitive used in modals |
| `Buttons.jsx` | `StatCard`, `AddButton`, `ExportCSVButton`, `PageHeader` |
| `*ModalContent.jsx` | Per-entity field sets (`TeamModalContent`, etc.) |
| `LangContext.jsx` | `LangProvider` + `useLang()` hook |
| `i18n.js` | Translation strings for `gr` and `en` |
| `styles.js` | Design tokens: `colors`, `fonts`, `radius`, `s` |

### API Client Layer (`frontend/src/api/`)

All files use `VITE_API_URL` env var as base. Each exposes:

```js
fetchAll(search?)   → GET /api/{entity}/
create(data)        → POST
update(id, data)    → PUT
remove(id)          → DELETE
```

Errors throw the parsed JSON error body. Api modules exist for: referees, stadiums, players, teams, matches, match_player_cards, match_player_goals — not yet wired to the live UI pages (mock data used in current UI).

### Vite Config

No proxy — relies on `VITE_API_URL` in `.env`. `usePolling: true` set for Docker file-watching on Windows.

---

## User App (`userapp/`)

### Status

Active development — mobile-style player-facing app with React Router, bottom nav, and multiple pages. Static HTML design prototypes exist in `frontend/mockup/` (user.html, calendar.html, TeamAppView.html).

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
- **Mockup-first design**: `frontend/mockup/` contains standalone HTML prototypes used to design screens. JSX components have been migrated to `frontend/src/` and are the live UI.
- **Django Ninja over DRF**: lighter, Pydantic-native, no serializer class boilerplate
- **One router file per entity**: keeps routers small and independently testable
- **Test structure**: `backend/api/tests/{unit,integration,functional,smoke}` — Playwright for frontend E2E
- **`.env` at root**: shared by all services via `env_file` in docker-compose
