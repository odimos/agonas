# Running Frontend Tests

Frontend tests use [Playwright](https://playwright.dev/) and run **locally** against
the Dockerized app. Playwright needs a real browser, so it cannot run inside a container
— but the app it tests does run in Docker.

---

## Prerequisites

**1. Start the full stack**
```bash
docker compose up
```

**2. Install Playwright (one-time, run locally inside `frontend/`)**
```bash
npm install
npx playwright install chromium
```

---

## Run modes

| Command | What it does |
|---|---|
| `npm run test:e2e` | Headless — no browser window, output in terminal |
| `npm run test:e2e:headed` | Headed — browser window opens, you can watch each step live |
| `npm run test:e2e:ui` | Interactive UI — best for real-time viewing and debugging |

### Interactive UI mode (recommended during development)
```bash
npm run test:e2e:ui
```
Opens Playwright's dashboard where you can:
- Run individual tests or all at once
- Step through each action one by one
- Inspect the DOM at any point in time
- See a full screenshot/timeline for every step

---

## Run a specific file

```bash
npx playwright test tests/referees.spec.js
```

## Run a specific test by name

```bash
npx playwright test -g "add referee modal opens"
```

## Run headed for a single file (one-off)

```bash
npx playwright test tests/referees.spec.js --headed
```

---

## Test files

| File | What it covers |
|---|---|
| `tests/referees.spec.js` | Full CRUD flow — list, add, details, edit, delete, search, modal close |

---

## How tests are structured

Each test that creates data via the API cleans it up afterwards with a
`request.delete` call. Tests can run in any order and against a shared
database without leaving behind stale records.

---

## Debugging a failing test

```bash
# Record a trace on failure
npx playwright test --trace on

# Open the trace viewer
npx playwright show-trace test-results/<test-name>/trace.zip
```

Or just use `npm run test:e2e:ui` — it retains traces automatically and lets
you replay any failed test step by step.
