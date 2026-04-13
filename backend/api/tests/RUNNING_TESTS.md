# Running Backend Tests

All tests run inside the backend container. The stack does not need to be up —
`docker compose run` spins up a temporary container just for the command.

---

## Run everything

```bash
docker compose run --rm backend python manage.py test api
```

## Run by category

```bash
docker compose run --rm backend python manage.py test api.tests.smoke
docker compose run --rm backend python manage.py test api.tests.unit
docker compose run --rm backend python manage.py test api.tests.integration
docker compose run --rm backend python manage.py test api.tests.functional
```

## Run a single file

```bash
docker compose run --rm backend python manage.py test api.tests.integration.test_referees_api
```

## Run a single test class

```bash
docker compose run --rm backend python manage.py test api.tests.integration.test_referees_api.RefereeCreateTest
```

## Run a single test method

```bash
docker compose run --rm backend python manage.py test api.tests.integration.test_referees_api.RefereeCreateTest.test_valid_payload_returns_201
```

---

## Useful flags

| Flag | Effect |
|---|---|
| `--verbosity 2` | Print each test name as it runs |
| `--keepdb` | Reuse the test database (faster on reruns) |
| `--failfast` | Stop on first failure |

Example:
```bash
docker compose run --rm backend python manage.py test api --verbosity 2 --keepdb
```

---

## Test categories explained

- **Smoke** — Fastest. Run first. If these fail, something is fundamentally broken (routing, DB connection, server config).
- **Unit** — Tests isolated logic with no HTTP. Model `save()` behaviour, schema validators.
- **Integration** — Tests a full HTTP request → view → database round-trip. One endpoint at a time.
- **Functional** — Tests multi-step workflows that represent real user actions (create → update → delete).
