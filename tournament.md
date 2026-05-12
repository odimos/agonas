Tournament has fields:
started date
type (knockout)
active (bool)
visibility (public, private)
And Tournament also has Phases (orderd) (must always have Phase one)

Phase has an order, could be represented as field (1,2,3..)
and be Open/Closed (instead of active/inactive): A phase cannot close if the prev is open
Teams
And matches 

We want to easily find the open Phases of a tournament.
match details view should include phase not only tournament
in dashboard the phases available should be only the open phases of the selected tournament.
creating new tournament should include the tournament fields and teams that will populate the phase 1 that will be created automatically.
matches that appear in phases should be actual matches stored that have this tournament/phase

## Rules

- A match belonging to a tournament MUST have a phase. Enforced on backend (schema) and frontend.
- Draft/canceled matches skip all validation. Only expected/finished enforce rules.
- Setting a match to friendly (no tournament) clears phase_id automatically.
- Two teams cannot play each other more than once in the same tournament+phase (dashboard conflict).
- BYE match: tournament match with one team null. Requires only one team to be set to finished.
- Teams belong to a phase via phase.team_ids (M2M). Can be added/removed on open phases only.

## Phase completion

1. All teams in phase.team_ids must have at least one finished match — otherwise blocked.
2. Winners: higher score wins, draw = both advance, bye = the one team advances.
3. Only teams still in phase.team_ids at completion time advance.
4. Current phase closes (is_open=false), new phase created with winners, user navigated to it.

## Schedule generation (POST /api/schedule/generate?phase_id=X)

Mode is auto-derived from tournament.type (knockout or league). Input: start_date, end_date.

- **league**: greedy scheduling of existing draft/expected matches. Ranks slots by preference score.
- **knockout**: random pairing, one match per team per phase. Odd teams get a BYE. Creates new Match objects on apply.

Slot score = home_team_pref + away_team_pref + referee_pref (0-9). Hard constraints: no team/referee twice same day, stadium capacity respected.

Apply (POST /api/schedule/apply?phase_id=X): sets matches to expected, assigns stadium+time. Knockout creates new Match objects.

## Stadium availability

Slots: day-of-week (0=Mon..6=Sun) + start_time (quarter precision) + quantity.
Dashboard time picker shows only available slots for chosen stadium+day.
Conflict: two matches at same stadium/date/time only flag if count exceeds slot quantity.

## Team & Referee preferences

Score 0–3 per stadium availability slot (0=No/red, 1=Low, 2=Medium, 3=High).
Stored in TeamPreference and RefereePreference (FK to team/referee + availability + score).
Used by scheduler to rank slots. Editable in team/referee detail modal (accordion per stadium).
