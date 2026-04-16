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

## Running Tests

### Backend (Django) — runs inside Docker, no stack needed

```bash
# All tests
docker compose run --rm backend python manage.py test api

# By category
docker compose run --rm backend python manage.py test api.tests.smoke
docker compose run --rm backend python manage.py test api.tests.unit
docker compose run --rm backend python manage.py test api.tests.integration
docker compose run --rm backend python manage.py test api.tests.functional

# Specific entity
docker compose run --rm backend python manage.py test api.tests.integration.test_referees_api
docker compose run --rm backend python manage.py test api.tests.integration.test_stadiums_api
```

> Add `--verbosity 2` to see each test name. Add `--keepdb` to skip recreating the test DB on reruns.

---

### Frontend (Playwright) — runs locally, stack must be running

**One-time setup (inside `frontend/`):**
```bash
npm install
npx playwright install chromium
```

**Run tests:**
```bash
# Headless (terminal output only)
npm run test:e2e

# Headed (watch the browser)
npm run test:e2e:headed

# Interactive UI — step through tests in real time
npm run test:e2e:ui

# Specific file
npx playwright test tests/referees.spec.js
npx playwright test tests/stadiums.spec.js
```

> Full docs: `frontend/tests/RUNNING_TESTS.md`
> Backend test docs: `backend/api/tests/RUNNING_TESTS.md`