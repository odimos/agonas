a user has a username and password
roles a user can have (one or many)
Player [connected to Player]
Captain (Must be Player to be captain) [connected to Team, directly or by Player being captain of Team ]
Referee [Connected to Referee]



If Referee then in http://localhost:5174/user the assignment button is visible, else it is not.
If user is referee, a "Referee" should appear under Team.
If user is not a Player then in /user no team should be displayed, and no recent matches. 
If user is not a Player then in bottom nav there shouldnt be the Team icon. 
If user is Player but not captain, then in /team no "edit" button should appear. This button should appear if theuser is captain.

For referees, in /forms, the open Forms should be got from the matches that are expected and have assigned this specific referee. 
In submitted the earlier submited Forms for this referee. 
Dont forget to make the link to referee-form/id with the match id. 



  │ ref1     │ pass123  │ Referee (ddd Giannakopoulos)                                                    │
  ├──────────┼──────────┼─────────────────────────────────────────────────────────────────────────────────┤
  │ player1  │ pass123  │ Player (Zara Alpha, Zeta FC) — also captain since her player was set as captain │
  ├──────────┼──────────┼─────────────────────────────────────────────────────────────────────────────────┤
  │ captain1 │ pass123  │ Player (Zara Alpha, Zeta FC) — same player as player1                           │
  ├──────────┼──────────┼─────────────────────────────────────────────────────────────────────────────────┤
  │ noncap   │ pass123  │ Player (Aaron Beta, Zeta FC) — not captain                                      │

    Credentials for the management console (localhost:5173):  - Username: admin
  - Password: agonas2026