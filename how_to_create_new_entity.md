## i Want to create the CRUD endpoint for Teams
## i need the db model, ninja schema, ninja api, the frontend and tests.
 
Overwritte the existing mockup model with the actual one:
TEAM	 DB model:			
name,type,required,can_be_empty,validator
name,CharField(100),YES,NO,Trim
is_active,Bool,YES,,
comments,TextField,NO,YES,Trim
captain_player_id -> player.id,FK,NO,,
vice_captain_player_id -> player.id,FK,NO,,

Use similar UI for the front end as we did for referees. You can see the wireframes in frontend\wireframes\referee or directly in the frontend\src\pages\RefereesPage.jsx
Also use similar structure as we did for referees, you can see a summary of the previous work in the following example. Dont overstretch with tests, just important ones, this is an mvp.

 ## Example from referee:
 Everything is written. Here's a summary of what was created and what you need to do to run it:

  What was created

  Backend

  ┌─────────────────────────┬───────────────────────────────────────────────────────────────┐
  │          File           │                         What it does                          │
  ├─────────────────────────┼───────────────────────────────────────────────────────────────┤
  │ api/models.py           │ Referee model — trims all fields on save()                    │
  ├─────────────────────────┼───────────────────────────────────────────────────────────────┤
  │ api/schema.py           │ RefereeIn (validates required + trims), RefereeOut            │
  ├─────────────────────────┼───────────────────────────────────────────────────────────────┤
  │ api/routers/referees.py │ Full CRUD: GET/POST /referees/, GET/PUT/DELETE /referees/{id} │
  ├─────────────────────────┼───────────────────────────────────────────────────────────────┤
  │ api/views.py            │ Mounts the referees router at /api/referees                   │
  ├─────────────────────────┼───────────────────────────────────────────────────────────────┤
  │ api/tests.py            │ 14 Django tests (model + all API endpoints)                   │
  └─────────────────────────┴───────────────────────────────────────────────────────────────┘

  Frontend

  ┌──────────────────────────────────────────────┬─────────────────────────────────────────┐
  │                     File                     │              What it does               │
  ├──────────────────────────────────────────────┼─────────────────────────────────────────┤
  │ src/api/referees.js                          │ Fetch helpers for all 4 operations      │
  ├──────────────────────────────────────────────┼─────────────────────────────────────────┤
  │ src/components/referees/Modal.jsx            │ Reusable modal shell                    │
  ├──────────────────────────────────────────────┼─────────────────────────────────────────┤
  │ src/components/referees/AddRefereeModal.jsx  │ Add form                                │
  ├──────────────────────────────────────────────┼─────────────────────────────────────────┤
  │ src/components/referees/EditRefereeModal.jsx │ Edit form (pre-filled)                  │
  ├──────────────────────────────────────────────┼─────────────────────────────────────────┤
  │ src/components/referees/DetailsModal.jsx     │ Read-only view with Edit/Delete buttons │
  ├──────────────────────────────────────────────┼─────────────────────────────────────────┤
  │ src/components/referees/DeleteModal.jsx      │ Confirmation dialog                     │
  ├──────────────────────────────────────────────┼─────────────────────────────────────────┤
  │ src/pages/RefereesPage.jsx                   │ List + search + modal orchestration     │
  ├──────────────────────────────────────────────┼─────────────────────────────────────────┤
  │ tests/referees.spec.js                       │ 7 Playwright E2E tests                  │
  └──────────────────────────────────────────────┴─────────────────────────────────────────┘