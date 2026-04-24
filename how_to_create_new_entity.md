## i Want to create the CRUD endpoint for MATCH_PLAYER_CARD and MATCH_PLAYER_GOAL
## i need the db model, ninja schema, ninja api, the frontend and tests.
 
MATCH_PLAYER_CARD
name,type,required,can_be_empty,validator
team_id -> team.id,FK,YES,-,"team must be one of the two from the match id"
player_id -> player.id,FK,YES,-,"player must belong to team"
match_id -> match.id,FK,YES,-,-
card_type,CharField(10),YES,NO,"[yellow, red]"
minute,IntegerField,YES,-,"[0–130]"
comments,TextField,NO,YES,Trim

MATCH_PLAYER_GOAL
name,type,required,can_be_empty,validator
team_id -> team.id,FK,YES,-,"team must be one of the two from the match id"
player_id -> player.id,FK,YES,-,"player must belong to the team"
match_id -> match.id,FK,YES,-,-
own_goal,BooleanField,YES,-,-
minute,IntegerField,YES,-,"[0–130]"

These will be handled from:
There must be a Match Goals area inside match details for every status FINISHED match, the way there is a players area inside the Team details. 
And a Match Cards area.

And each area will have the option Add New Goal or Add New Card.
With the add button a modal will open having the fields that must be inserted, and button options "add" and "cancel".
While the modal is open the "add new card/goal" should not be visible. 
The match field should be not visible but prefilled from the match we are inside of, and the available teams should be only the two of the specific match and the players only the ones from the teams and if team selected the selected team.

After creating these and the respective tests, run the tests yourself (u can see README.md for how), and fix any problems on the spot. 

 ## Example work from referee:

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

