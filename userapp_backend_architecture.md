# Userapp Backend Architecture

The `userapp` Django app is the backend that powers the mobile-style front-end at port 5174 (the same one served by the `userapp/` React app). It is separate from the admin/management API in `api/`, and it serves players, team captains, and referees.

## 1. App layout

```
backend/userapp/
├── apps.py            # Django app config
├── models.py          # AppUser model
├── views.py           # Django Ninja API: schemas + endpoints
├── urls.py            # mounts the Ninja API under /app/api/
├── migrations/
└── tests.py
```

It is wired into the project URLs in `backend/config/urls.py`:

```python
path("app/", include("userapp.urls")),
```

So every endpoint in `userapp/views.py` is reachable at `/app/api/<path>`.

## 2. Data model

`userapp` adds one model on top of the entities defined in `api/models.py`:

### `AppUser`

| Field      | Type           | Notes                                                    |
|------------|----------------|----------------------------------------------------------|
| username   | CharField(150) | unique — used for login                                  |
| password   | CharField(128) | stored plaintext (simple project, no hashing)            |
| bio        | TextField      | optional, editable by the user from `/user`              |
| photo      | ImageField     | optional avatar, uploaded to `media/users/`              |
| player     | FK → Player    | nullable — links to the player record this user "is"    |
| referee    | FK → Referee   | nullable — links to the referee record this user "is"   |

Roles are derived, not stored as columns:

- **is_player**     → `player_id is not None`
- **is_referee**    → `referee_id is not None`
- **is_captain**    → derived: `Team.objects.filter(captain=self.player).exists()`

A single `AppUser` may have *both* a player and a referee link, but at most one of each type. Roles surface in the response of `/auth/me` so the front-end can render the right UI (e.g., bottom-nav tabs, the Forms shortcut for referees, the Edit button on `/team` only for captains).

## 3. Authentication

The userapp uses Django's session cookies — no JWT, no DRF. The flow is:

1. Front-end POSTs `{username, password}` to `/app/api/auth/login`.
2. View loads the matching `AppUser`, compares the password verbatim, and writes `request.session['user_id'] = user.id`. Django attaches a session cookie to the response.
3. Subsequent requests carry that cookie automatically (front-end uses `credentials: 'include'`).
4. Every protected endpoint reads `request.session.get('user_id')` and looks up the user. If missing, it raises `HttpError(401)`.
5. `/app/api/auth/logout` calls `request.session.flush()`.

Because this lives in `request.session`, it does not collide with the admin auth in `api/` (which uses `request.session['admin']`).

### Authorization model

There are no decorators or middleware — each endpoint that needs gating performs the check inline. The common patterns are:

- **Logged in**: `if not user_id: raise HttpError(401)`
- **Referee only**: `if not user.referee_id: raise HttpError(403)`
- **Player only**: `if not user.player_id: raise HttpError(403)`
- **Captain only**: `if not user.is_captain(): raise HttpError(403)`

This keeps each endpoint readable and self-contained.

## 4. API surface

All endpoints are mounted under `/app/api/`. Grouped by concern:

### Auth & profile

| Method | Path             | Purpose                                                      |
|--------|------------------|--------------------------------------------------------------|
| POST   | `/auth/login`    | Username/password → session cookie + `MeOut` payload         |
| POST   | `/auth/logout`   | Clears the session                                           |
| GET    | `/auth/me`       | Returns the logged-in user (roles + team info if any)        |
| PATCH  | `/auth/bio`      | Updates `bio` on the current user                            |
| POST   | `/auth/photo`    | Multipart upload — replaces the user's avatar                |

`MeOut` is what every screen consumes to know "who am I and what can I do":

```python
class MeOut(Schema):
    id, username, bio
    is_player, is_referee, is_captain
    player_id, referee_id
    team_id, team_name      # populated when the user is a player on a team
    photo_url
```

### Referee endpoints

| Method | Path                              | Purpose                                                     |
|--------|-----------------------------------|-------------------------------------------------------------|
| GET    | `/referee/me`                     | Returns the linked `Referee` record's basic info            |
| GET    | `/referee/matches/open`           | Matches assigned to this referee with `status='expected'`   |
| GET    | `/referee/matches/submitted`      | Matches assigned to this referee with `status='finished'`   |

`open` is what powers both the Forms page and the Notifications list — only `expected` matches show up; drafts and canceled never do.

### Player endpoints

| Method | Path                              | Purpose                                                     |
|--------|-----------------------------------|-------------------------------------------------------------|
| GET    | `/player/me`                      | Returns the linked `Player` record's basic info             |
| GET    | `/player/goals`                   | Career goal count (excludes own-goals)                      |
| GET    | `/players/{player_id}/profile`    | Public profile: name, team, goals, yellow/red card totals   |

### Team endpoints

| Method | Path                              | Purpose                                                     |
|--------|-----------------------------------|-------------------------------------------------------------|
| GET    | `/team/{team_id}/photo`           | Lightweight: just the team's photo URL                      |
| POST   | `/team/photo`                     | Multipart upload — captain only, sets photo on *their* team |
| GET    | `/team/{team_id}/matches`         | List of expected + finished matches with win/loss/draw      |
| GET    | `/team/{team_id}/info`            | Roster, win/draw/loss tallies, and tournament participation |

### Match endpoints (referee form path)

| Method | Path                              | Purpose                                                     |
|--------|-----------------------------------|-------------------------------------------------------------|
| GET    | `/matches/{match_id}`             | Header info for a match (teams, stadium, tournament type)   |
| GET    | `/matches/{match_id}/players`     | Roster eligible to receive goals/cards (both teams)         |
| POST   | `/matches/{match_id}/finish`      | Submit the referee form: scores, fair play, goals, cards    |

`GET /matches/{id}` exposes `tournament_type` so the form knows when to require a penalty winner (knockout + tied score).

`POST /matches/{id}/finish` is the most validation-heavy endpoint — see below.

## 5. The finish-match flow

This is the path that turns a scheduled fixture into a recorded result. It is invoked by the referee from `RefereeForm.jsx`.

```
Front-end (RefereeForm.jsx)
   │
   │ POST /app/api/matches/{id}/finish
   │  body: FinishMatchIn
   ▼
finish_match(request, match_id, payload)
   │
   ├─ load Match (with home/away/tournament) or 404
   ├─ guard: status must be 'expected' (else 400)
   ├─ validate scores ≥ 0 (else 422)
   ├─ validate fair play 0..5 (else 422)
   ├─ validate every card_type ∈ {yellow, red} (else 422)
   │
   ├─ knockout-tie check:
   │     if tournament.type == 'knockout' and home_score == away_score:
   │       penalty_winner_id must be set and ∈ {home, away}
   │
   └─ atomic transaction:
        ├─ Match.status = 'finished'
        ├─ store scores, fair play, comments, penalty_winner_id
        ├─ create MatchPlayerGoal rows for every goal in payload
        └─ create MatchPlayerCard rows for every card in payload
```

The transaction is critical: if any goal/card create fails, the match must not be flipped to `finished` half-recorded.

`FinishMatchIn` allows the front-end to submit everything in a single call, so the referee form is "fill in the page, hit Submit, done."

## 6. Schemas (Django Ninja)

All request and response bodies use `ninja.Schema` (Pydantic v2 under the hood). The schemas live at the top of `views.py` and are grouped by concern:

- **Auth**: `LoginIn`, `MeOut`, `BioIn`
- **Match (referee form)**: `GoalIn`, `CardIn`, `FinishMatchIn`, `MatchInfoOut`, `PlayerOut`, `RefereeMatchOut`

Schemas give two things:

1. **Automatic request validation** — wrong types or missing fields → 422 with a structured error body. The Notifications / Forms / RefereeForm UI surfaces those errors verbatim.
2. **Type-checked responses** — `response=MeOut` will strip any extra fields the view returns by accident.

## 7. Cross-app dependencies

`userapp` imports from `api.models` for everything that already exists (Player, Referee, Team, Match, MatchPlayerCard, MatchPlayerGoal, Phase, Tournament). The relationship is one-way: `api` knows nothing about `userapp`, but `userapp` reads and writes records from `api`.

This keeps the management API in `api/` clean and lets the public-facing endpoints live behind a separate Ninja `NinjaAPI(urls_namespace='userapp')` instance, so URL names don't collide.

## 8. Media

User avatars and team photos uploaded through `userapp` land under `MEDIA_ROOT/users/` and `MEDIA_ROOT/teams/`. The helper `_media_url(file_field)` prefixes every URL with `settings.PUBLIC_BASE_URL` so the front-end (different port) can fetch them without CORS path issues.

## 9. Why session auth (and not JWT)?

- This is a small project; the front-end and back-end share a domain when deployed.
- Session cookies are automatic — no token storage in localStorage, no refresh dance.
- `request.session.flush()` is a clean logout.
- For the admin in `api/`, the same mechanism is used with a different session key, so the two namespaces stay isolated.

## 10. Adding a new endpoint — recipe

1. Define request/response schemas at the top of `views.py`.
2. Add a function decorated with `@api.get/post/...('/your/path', response=YourOut)`.
3. Inside: read `request.session.get('user_id')`, raise `HttpError(401)` if missing.
4. Add any role guard (`if not user.referee_id: raise HttpError(403)` etc.).
5. Do the work; return the data — Ninja serializes it through the response schema.
6. No URL changes needed; `api.urls` already exposes everything under `/app/api/`.
