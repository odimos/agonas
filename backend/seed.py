"""
Seed script: cleans junk data and fills with realistic Greek football league data.
Run with: python manage.py shell < seed.py
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import transaction
from api.models import (
    Team, Player, Referee, Stadium, StadiumAvailability,
    TeamPreference, RefereePreference, Tournament, Phase, Match,
    MatchPlayerCard, MatchPlayerGoal
)
from userapp.models import AppUser

# ── IDs to preserve ─────────────────────────────────────────────────────────
KEEP_REFEREE_ID = 2   # ref1's referee
KEEP_PLAYER_IDS = [159, 160]  # captain1 and noncap

print("Starting seed...")

with transaction.atomic():

    # ── 1. Clean up ─────────────────────────────────────────────────────────
    print("Cleaning up...")

    # Detach AppUser foreign keys before deleting
    AppUser.objects.exclude(referee_id=None).exclude(referee_id=KEEP_REFEREE_ID).update(referee=None)
    AppUser.objects.exclude(player_id=None).exclude(player_id__in=KEEP_PLAYER_IDS).update(player=None)

    MatchPlayerGoal.objects.all().delete()
    MatchPlayerCard.objects.all().delete()
    Match.objects.all().delete()
    Phase.objects.all().delete()
    Tournament.objects.all().delete()

    TeamPreference.objects.all().delete()
    RefereePreference.objects.all().delete()
    StadiumAvailability.objects.all().delete()

    # Delete all players except kept ones, after clearing team captains
    Team.objects.update(captain=None, vice_captain=None)
    Player.objects.exclude(id__in=KEEP_PLAYER_IDS).delete()

    # Delete junk referees except kept one
    Referee.objects.exclude(id=KEEP_REFEREE_ID).delete()

    # Delete all teams and stadiums
    Team.objects.all().delete()
    Stadium.objects.all().delete()

    # Kept players are now teamless — will reassign below

    # ── 2. Stadiums ──────────────────────────────────────────────────────────
    print("Creating stadiums...")

    STADIUMS_DATA = [
        {'name': 'Karaiskakis Stadium',  'phone': '2104293000', 'address': 'Faliro, Athens',       'email': 'info@karaiskakis.gr',  'cost': 4000},
        {'name': 'OPAP Arena',           'phone': '2102289000', 'address': 'Galatsi, Athens',       'email': 'info@opaparena.gr',    'cost': 3500},
        {'name': 'Toumba Stadium',       'phone': '2310950000', 'address': 'Thessaloniki',           'email': 'info@toumba.gr',       'cost': 3000},
        {'name': 'Panthessaliko Stadium','phone': '2421061000', 'address': 'Volos',                  'email': 'info@panthessaliko.gr','cost': 1500},
        {'name': 'Pampeloponnisiako',    'phone': '2610226000', 'address': 'Patras',                 'email': 'info@pampe.gr',        'cost': 1800},
    ]

    stadiums = []
    for s in STADIUMS_DATA:
        st = Stadium.objects.create(**s, map_url='', comments=None)
        stadiums.append(st)

    # Availabilities: each stadium gets 2-3 slots across different days/times
    # day: 0=Mon,1=Tue,2=Wed,3=Thu,4=Fri,5=Sat,6=Sun
    AVAIL = [
        # Karaiskakis
        (stadiums[0], 5, '10:00', 2),
        (stadiums[0], 6, '11:00', 2),
        (stadiums[0], 3, '18:00', 1),
        # OPAP Arena
        (stadiums[1], 5, '12:00', 2),
        (stadiums[1], 6, '10:00', 2),
        (stadiums[1], 2, '19:00', 1),
        # Toumba
        (stadiums[2], 5, '15:00', 2),
        (stadiums[2], 6, '12:00', 2),
        (stadiums[2], 4, '18:00', 1),
        # Panthessaliko
        (stadiums[3], 5, '11:00', 2),
        (stadiums[3], 6, '14:00', 2),
        # Pampeloponnisiako
        (stadiums[4], 5, '16:00', 2),
        (stadiums[4], 6, '11:00', 2),
        (stadiums[4], 1, '19:00', 1),
    ]

    availabilities = []
    for st, day, time, qty in AVAIL:
        av = StadiumAvailability.objects.create(stadium=st, day=day, start_time=time, quantity=qty)
        availabilities.append(av)

    # ── 3. Teams ─────────────────────────────────────────────────────────────
    print("Creating teams...")

    TEAM_NAMES = [
        'Olympiakos FC', 'Panathinaikos FC', 'AEK Athens FC', 'PAOK FC',
        'Aris FC', 'Atromitos FC', 'OFI Crete FC', 'Asteras Tripolis FC',
        'Panionios FC', 'Ionikos FC', 'Lamia FC', 'Volos NFC',
        'Levadiakos FC', 'Giannina FC', 'Xanthi FC', 'Platanias FC',
        'Apollon Smyrnis FC', 'Ergotelis FC', 'Panachaiki FC', 'Ethnikos Piraeus FC',
    ]

    teams = []
    for name in TEAM_NAMES:
        t = Team.objects.create(name=name, is_active=True)
        teams.append(t)

    # Reassign kept players to first two teams
    kept_players = list(Player.objects.filter(id__in=KEEP_PLAYER_IDS))
    if len(kept_players) >= 1:
        kept_players[0].team = teams[0]  # Olympiakos
        kept_players[0].save()
    if len(kept_players) >= 2:
        kept_players[1].team = teams[0]
        kept_players[1].save()

    # ── 4. Players ───────────────────────────────────────────────────────────
    print("Creating 100 players...")

    FIRST_NAMES = [
        'Nikos', 'Giorgos', 'Kostas', 'Dimitris', 'Yannis', 'Thanasis', 'Petros',
        'Michalis', 'Alexandros', 'Stavros', 'Vasilis', 'Panagiotis', 'Lefteris',
        'Christos', 'Stelios', 'Manolis', 'Antonis', 'Spiros', 'Tasos', 'Babis',
    ]
    LAST_NAMES = [
        'Papadopoulos', 'Georgiou', 'Nikolaou', 'Alexiou', 'Ioannou', 'Konstantinou',
        'Athanasiou', 'Stavrou', 'Vasiliou', 'Papageorgiou', 'Makris', 'Dimos',
        'Theodorou', 'Christodoulou', 'Andreou', 'Oikonomou', 'Tsimikas', 'Fortounis',
        'Bakasetas', 'Mantalos', 'Retsos', 'Fountas', 'Pelkas', 'Limnios', 'Chatzitheodoridis',
    ]

    # 5 players per team = 100 players across 20 teams
    # Already have 2 kept players in teams[0], add 3 more there, 5 to each other team
    new_players = []
    player_idx = 0
    for t_idx, team in enumerate(teams):
        existing = Player.objects.filter(team=team).count()
        needed = 5 - existing
        for i in range(needed):
            fn = FIRST_NAMES[player_idx % len(FIRST_NAMES)]
            ln = LAST_NAMES[player_idx % len(LAST_NAMES)]
            # avoid duplicate names in same team
            suffix = '' if player_idx < len(FIRST_NAMES) else str(player_idx // len(FIRST_NAMES))
            p = Player.objects.create(
                first_name=fn,
                last_name=ln + suffix if suffix else ln,
                team=team,
            )
            new_players.append(p)
            player_idx += 1

    # Set captains and vice-captains
    for team in teams:
        squad = list(Player.objects.filter(team=team))
        if len(squad) >= 1:
            team.captain = squad[0]
        if len(squad) >= 2:
            team.vice_captain = squad[1]
        team.save()

    # Update AppUser captain1 to point to the captain of Olympiakos
    try:
        u_cap = AppUser.objects.get(username='captain1')
        u_cap.player = teams[0].captain
        u_cap.save()
    except AppUser.DoesNotExist:
        pass

    # Update noncap to point to a non-captain Olympiakos player
    try:
        u_noncap = AppUser.objects.get(username='noncap')
        squad = list(Player.objects.filter(team=teams[0]))
        noncap_player = next((p for p in squad if p != teams[0].captain and p != teams[0].vice_captain), None)
        if noncap_player:
            u_noncap.player = noncap_player
            u_noncap.save()
    except AppUser.DoesNotExist:
        pass

    # ── 5. Referees ──────────────────────────────────────────────────────────
    print("Creating referees...")

    REFEREES = [
        ('Apostolos', 'Tolios',       '6971000001', 'tolios@refs.gr'),
        ('Kyriakos',  'Dermitzakis',  '6971000002', 'dermitz@refs.gr'),
        ('Nikos',     'Deligiannis',  '6971000003', 'delig@refs.gr'),
        ('Stavros',   'Bouzas',       '6971000004', 'bouzas@refs.gr'),
        ('Michalis',  'Koukoulakis',  '6971000005', 'koukoul@refs.gr'),
        ('Petros',    'Mavros',       '6971000006', 'mavros@refs.gr'),
        ('Giorgos',   'Sarris',       '6971000007', 'sarris@refs.gr'),
        ('Kostas',    'Papapetrou',   '6971000008', 'papap@refs.gr'),
        ('Thanasis',  'Kominis',      '6971000009', 'kominis@refs.gr'),
    ]

    referees = [Referee.objects.get(id=KEEP_REFEREE_ID)]  # ref1 stays as first
    for fn, ln, phone, email in REFEREES:
        r = Referee.objects.create(first_name=fn, last_name=ln, phone=phone, email=email)
        referees.append(r)

    # ── 6. Preferences ───────────────────────────────────────────────────────
    print("Creating preferences...")

    # Team preferences: each team prefers Saturday slots, some prefer Sunday
    sat_avails = [av for av in availabilities if av.day == 5]
    sun_avails = [av for av in availabilities if av.day == 6]

    for i, team in enumerate(teams):
        # All teams prefer a Saturday slot (score 3)
        pref_sat = sat_avails[i % len(sat_avails)]
        TeamPreference.objects.get_or_create(team=team, availability=pref_sat, defaults={'score': 3})
        # Half prefer a Sunday slot too (score 2)
        if i % 2 == 0:
            pref_sun = sun_avails[i % len(sun_avails)]
            if pref_sun != pref_sat:
                TeamPreference.objects.get_or_create(team=team, availability=pref_sun, defaults={'score': 2})

    # Referee preferences: each referee available on 2 slots
    for i, ref in enumerate(referees):
        av1 = availabilities[i % len(availabilities)]
        av2 = availabilities[(i + 2) % len(availabilities)]
        RefereePreference.objects.get_or_create(referee=ref, availability=av1, defaults={'score': 3})
        if av2 != av1:
            RefereePreference.objects.get_or_create(referee=ref, availability=av2, defaults={'score': 2})

    # ── 7. Tournaments ───────────────────────────────────────────────────────
    print("Creating tournaments...")

    league = Tournament.objects.create(
        name='Super League 2025/26',
        type='league',
        active=True,
        visibility='public',
    )
    cup = Tournament.objects.create(
        name='Greek Cup 2025/26',
        type='knockout',
        active=True,
        visibility='public',
    )

    # League: 1 phase with all 20 teams
    league_phase = Phase.objects.create(tournament=league, order=1, is_open=True)
    league_phase.teams.set(teams)

    # Cup: round of 16 (phase 1, closed) → quarter finals (phase 2, open)
    cup_phase1 = Phase.objects.create(tournament=cup, order=1, is_open=False)
    cup_phase1.teams.set(teams)
    cup_phase2 = Phase.objects.create(tournament=cup, order=2, is_open=True)
    cup_phase2.teams.set(teams[:10])  # 10 teams advanced

print("\nDone!")
print(f"  Stadiums: {Stadium.objects.count()}")
print(f"  Teams:    {Team.objects.count()}")
print(f"  Players:  {Player.objects.count()}")
print(f"  Referees: {Referee.objects.count()}")
print(f"  Tournaments: {Tournament.objects.count()}")
print(f"  Phases:   {Phase.objects.count()}")
print(f"  AppUsers: {AppUser.objects.count()} — preserved")
