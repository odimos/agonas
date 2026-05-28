# Scheduling Algorithm

This document describes how the auto-scheduler builds a program for a tournament phase. The code lives in `backend/api/routers/schedule.py`, exposed as two endpoints:

- `POST /api/schedule/generate?phase_id={id}` — returns a preview (no DB writes).
- `POST /api/schedule/apply?phase_id={id}`   — commits a previously generated preview.

The front-end calls `generate` when the user clicks **Δημιουργία Προγράμματος**, shows the preview, and calls `apply` when they confirm.

## 1. Inputs

`ScheduleRequest`:

| Field         | Meaning                                                                  |
|---------------|--------------------------------------------------------------------------|
| `start_date`  | First day of the scheduling window (inclusive).                          |
| `end_date`    | Last day of the window (inclusive).                                      |
| `mode`        | `'league'` or `'knockout'`. Picks which generator runs.                  |
| `from_scratch`| If true, existing draft/expected (and BYE) matches in the phase are disconnected first. |

The phase's `team_ids` is the universe of teams; `StadiumAvailability` rows define when each stadium has a slot; `TeamPreference` and `RefereePreference` rows score how much a team / referee wants a given availability (0 = blocking, 1–3 = increasing preference).

## 2. Common pre-processing

For every call, regardless of mode:

1. **Disconnect step (only if `from_scratch=True`)**
   - All `draft` / `expected` matches in this phase are stripped of `phase` and `tournament` (the matches survive globally; they just stop counting toward this phase).
   - All **BYE finished matches** (status `finished` with exactly one team) are stripped the same way. Real finished matches with two teams stay attached.

2. **Slot expansion** (`_expand_slots`)
   - Walks every date in `[start_date, end_date]`.
   - For each date's weekday, emits one slot per `StadiumAvailability` that matches that weekday.
   - Each slot carries: datetime, stadium id+name, availability id, capacity (`quantity`).

3. **Preference indexes**
   - `team_prefs[team_id][availability_id] → score` for every team in the phase.
   - `ref_prefs[referee_id][availability_id] → score` for every referee.

## 3. League mode (`_generate_league`)

Used when the tournament's `type` is `league`. The phase must already contain the matches you want scheduled — league mode does **not invent fixtures**; it only assigns date/time/stadium/referee to matches that exist as `draft` or `expected`.

### Steps

1. **Load the candidates**
   - Fetch all `draft` / `expected` matches in the phase.
   - If there are none, raise 400 ("nothing to schedule").

2. **Sort by scarcity** (the "fewest options first" heuristic)
   - For each match, count how many slots have a non-negative score for it.
   - Matches with fewer feasible slots get scheduled first, so they don't get crowded out by easier matches.

3. **Greedy assignment**
   - For each match in that order, iterate every slot and pick the best one.
   - A slot is **eligible** if:
     - Neither team already plays on that date (`day_teams[date]`).
     - The slot isn't full (`slot_used[i] < capacity`).
     - A referee is available — either the match's own referee (if not already booked that day) or some free referee picked by `_pick_referee`.
   - A slot's **score** = home-team preference + away-team preference + chosen-referee preference (all looked up by availability id; missing entries = 0).
   - The slot with the highest score wins.

4. **Commit slot bookkeeping**
   - Mark both teams busy on that date.
   - Mark the chosen referee busy on that date.
   - Increment `slot_used[i]` so the next match competes for the remaining capacity.

5. **Build the preview**
   - Each successful assignment becomes a `ScheduleSuggestion` with `match_id` set (it points to the existing match — apply will only update fields).
   - Any match the loop couldn't place ends up in `unscheduled`.

### Properties

- **One match per team per day**: hard constraint.
- **One match per referee per day**: enforced when picking the referee (and the referee-overbooking check on the dashboard uses a tighter 60-minute rule, but the scheduler is intentionally conservative).
- **Capacity respected per slot**: a slot with `quantity=3` accepts up to three matches.
- The algorithm is **greedy, not optimal** — it makes the best choice for the most-constrained match first and never backtracks. In practice this is good enough; pathological cases land in `unscheduled` and the user can adjust.

## 4. Knockout mode (`_generate_knockout`)

Used when the tournament's `type` is `knockout`. Unlike league mode, this generator **creates new matches** — the phase isn't pre-seeded with pairings.

### Steps

1. **Compute the team pool**
   - If `from_scratch=True`, the pool is the full `phase.team_ids`.
   - Otherwise, exclude teams that already have an `expected` / `finished` match in this phase (they're already covered).
   - If the pool is empty, raise 400 ("all teams already paired").

2. **Random pairing**
   - Shuffle the pool and pair them off two at a time.
   - If the count is odd, the leftover team gets a **BYE**.

3. **Slot search for real pairs**
   - Same eligibility rules as league mode (date-conflict, capacity, free referee).
   - Score = home pref + away pref + referee pref.
   - Best slot wins.
   - A pair that can't be placed lands in `unscheduled_specs` (no `match_id`; just the team ids — the front-end can decide what to do).

4. **BYE handling**
   - A BYE skips the slot search entirely. No stadium, no time-of-day, no referee.
   - The suggestion still carries a placeholder `scheduled_at` set to midnight of `start_date` so the BYE appears in the right dashboard week bucket.
   - On apply, the BYE match is created with `status='finished'` (the lone team auto-advances).

### Properties

- **Each team plays exactly once per phase** (a BYE counts as their "match").
- BYE matches don't consume stadium availability.
- Pairing is **random** — there's no seeding logic, no avoiding rematches of previous rounds. If you want a particular bracket structure, you create the matches manually before running the scheduler.

## 5. Apply (`apply_schedule`)

The preview is a `List[ScheduleSuggestion]`. The apply endpoint walks them:

- If `s.match_id` is set → update that existing match: stadium, scheduled_at, status (`expected`), referee (if provided).
- If `s.match_id` is null → create a brand-new match:
  - `status='finished'` when `is_bye=True`, else `status='expected'`.
  - BYE matches don't get `stadium_id` / `referee_id` but keep `scheduled_at` for bucketing.
  - The new match is attached to the phase and the tournament.

No additional validation runs here — the validation happened (or didn't) on whatever path created the source matches. The contract is: the preview was reviewed by a human before apply.

## 6. Helpers

- `_expand_slots(avs, start_date, end_date)` — flattens recurring stadium availability rows into concrete datetime slots within the window.
- `_slot_score(match, slot, team_prefs, ref_prefs)` — preference sum using whatever referee is *already* assigned to the match (used for the scarcity-ranking pass).
- `_slot_score_with_ref(match, slot, team_prefs, ref_prefs, referee_id)` — same, but with a specified referee (used in the inner loop after we've chosen one).
- `_pick_referee(all_referee_ids, ref_prefs, av_id, busy_referee_ids)` — among referees not busy that day, returns the one with the highest preference score for this availability. Returns `None` if nobody is free.

## 7. Design choices and limits

- **Greedy, single-pass**: O(matches × slots). No ILP solver, no constraint-propagation library. The codebase stays simple and the worst case (a few hundred matches × a few hundred slots) is sub-second.
- **Hard constraints baked in**: same-day double-booking is impossible by construction.
- **Soft preferences**: scores are additive. A team with a strong "yes" (3) on a slot will pull the scheduler toward that slot, but it can still be overridden if the other team prefers something else.
- **Score = 0 doesn't block**: a team with no recorded preference for a slot contributes 0, same as a team that explicitly said 0. (The dashboard's "Apply preferences" filter does distinguish explicit 0 from "no opinion", but the scheduler treats them the same.)
- **No retries**: a match that can't fit in any slot just goes to `unscheduled`. The user reschedules it manually (or expands the window).

## 8. End-to-end flow

```
User opens phase → clicks "Δημιουργία Προγράμματος"
        │
        ▼
ScheduleModal: pick start/end dates, mode, from-scratch toggle
        │
        ▼
POST /api/schedule/generate
        │
        ├─ if from_scratch: disconnect draft/expected/BYE finished matches
        ├─ expand stadium availabilities into slots
        ├─ load team & referee preference indexes
        ├─ mode === 'knockout' → _generate_knockout
        └─ mode === 'league'   → _generate_league
        │
        ▼
ScheduleResponse { suggestions, unscheduled, new_matches }
        │
        ▼
ScheduleModal previews the suggestions, lists anything unscheduled
        │
        ▼ user confirms
POST /api/schedule/apply
        │
        ├─ existing matches: update fields, flip to 'expected'
        └─ new matches:      create (BYE → 'finished', else 'expected')
        │
        ▼
Phase view refreshes with the new matches.
```
