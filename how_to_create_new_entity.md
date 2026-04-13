## i Want to create the CRUD endpoint for Match
## i need the db model, ninja schema, ninja api, the frontend and tests.
 

MATCH		DB MODEL:		
name,type,required,can_be_empty,validator
status,enum,YES,NO,"[draft, canceled, finished, expected]"
home_team_id -> team.id,FK,NO,,"must be different from away_team_id"
away_team_id -> team.id,FK,NO,,"must be different from home_team_id"
home_score,IntegerField,NO,,">= 0"
away_score,IntegerField,NO,,">= 0"
home_fair_play,IntegerField,NO,,"[-5 ~ 5]"
away_fair_play,IntegerField,NO,,"[-5 ~ 5]"
referee_id -> referee.id,FK,NO,,
stadium_id -> stadium.id,FK,NO,,
scheduled_at,DateTimeField,NO,,
comments,TextField,NO,YES,Trim
tournament_id,FK,NO,,	

Constraints you must enforce (both frontend and backend):
    status expected: 
    required: home_team_id, away_team_id, referee_id, stadium_id, scheduled_at
    and 
    home_team_id != away_team_id, scores/fair_play should be null

    status finished:
    required: home_team_id, away_team_id, referee_id, stadium_id, scheduled_at, home_score, away_score, referee_id, stadium_id, home_fair_play, away_fair_play

    status canceled or draft:
    required: None except status

Continuing

Tournament FK null means the match is friendly

Use similar UI for the front end as we did for referees. You can see the wireframes in frontend\wireframes\referee or directly in the frontend\src\pages\RefereesPage.jsx
Also use similar structure as we did for referees, you can see a summary of the previous work in the following example. Dont overstretch with tests, just important ones, this is an mvp. 
In the end RUN YOURSELF the tests and if any errors arise FIX them.

### For FKs, like home_team and away_team make them appear as clickable names that will open a new tab and navigate to the already existing details for them

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

