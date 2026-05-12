import json

from django.test import Client, TestCase

from api.models import Match, MatchPlayerCard, MatchPlayerGoal, Player, Referee, Stadium, Team, Tournament, Phase
from userapp.models import AppUser


# ── Helpers ──────────────────────────────────────────────────────────────────

def make_team(name='Home FC'):
    return Team.objects.create(name=name)

def make_referee():
    return Referee.objects.create(first_name='John', last_name='Doe', phone='6900000001')

def make_stadium():
    return Stadium.objects.create(name='Main St', phone='2100000001', address='Addr 1')

def make_expected_match(home=None, away=None, referee=None, stadium=None):
    home = home or make_team('Home FC')
    away = away or make_team('Away FC')
    referee = referee or make_referee()
    stadium = stadium or make_stadium()
    return Match.objects.create(
        status='expected', home_team=home, away_team=away,
        referee=referee, stadium=stadium,
        scheduled_at='2026-06-01T15:00:00',
    )

FINISH_OK = {
    'home_score': 2, 'away_score': 1,
    'home_fair_play': 3, 'away_fair_play': 2,
    'goals': [], 'cards': [],
}


# ── Auth tests ────────────────────────────────────────────────────────────────

class LoginTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.referee = make_referee()
        self.user = AppUser.objects.create(username='ref1', password='pass123', referee=self.referee)

    def _post(self, data):
        return self.client.post('/app/api/auth/login', json.dumps(data), content_type='application/json')

    def test_login_valid(self):
        res = self._post({'username': 'ref1', 'password': 'pass123'})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data['username'], 'ref1')
        self.assertTrue(data['is_referee'])
        self.assertFalse(data['is_player'])

    def test_login_wrong_password(self):
        res = self._post({'username': 'ref1', 'password': 'wrong'})
        self.assertEqual(res.status_code, 401)

    def test_login_unknown_user(self):
        res = self._post({'username': 'nobody', 'password': 'pass123'})
        self.assertEqual(res.status_code, 401)

    def test_me_after_login(self):
        self._post({'username': 'ref1', 'password': 'pass123'})
        res = self.client.get('/app/api/auth/me')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['username'], 'ref1')

    def test_me_unauthenticated(self):
        res = self.client.get('/app/api/auth/me')
        self.assertEqual(res.status_code, 401)

    def test_logout(self):
        self._post({'username': 'ref1', 'password': 'pass123'})
        self.client.post('/app/api/auth/logout')
        res = self.client.get('/app/api/auth/me')
        self.assertEqual(res.status_code, 401)


class UserRolesTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.team = make_team('Alpha FC')
        self.player = Player.objects.create(first_name='Ana', last_name='Z', team=self.team)
        self.team.captain = self.player
        self.team.save()
        self.captain_user = AppUser.objects.create(username='cap', password='p', player=self.player)

        self.player2 = Player.objects.create(first_name='Bob', last_name='Y', team=self.team)
        self.noncap_user = AppUser.objects.create(username='noncap', password='p', player=self.player2)

        self.referee = make_referee()
        self.ref_user = AppUser.objects.create(username='ref', password='p', referee=self.referee)

    def _login(self, username):
        self.client.post('/app/api/auth/login', json.dumps({'username': username, 'password': 'p'}), content_type='application/json')

    def test_captain_is_captain(self):
        self._login('cap')
        data = self.client.get('/app/api/auth/me').json()
        self.assertTrue(data['is_captain'])
        self.assertTrue(data['is_player'])

    def test_noncaptain_is_not_captain(self):
        self._login('noncap')
        data = self.client.get('/app/api/auth/me').json()
        self.assertFalse(data['is_captain'])
        self.assertTrue(data['is_player'])

    def test_referee_roles(self):
        self._login('ref')
        data = self.client.get('/app/api/auth/me').json()
        self.assertTrue(data['is_referee'])
        self.assertFalse(data['is_player'])
        self.assertFalse(data['is_captain'])

    def test_player_team_info(self):
        self._login('cap')
        data = self.client.get('/app/api/auth/me').json()
        self.assertEqual(data['team_name'], 'Alpha FC')
        self.assertIsNotNone(data['team_id'])


# ── Referee forms tests ───────────────────────────────────────────────────────

class RefereeFormsTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.referee = make_referee()
        self.ref_user = AppUser.objects.create(username='ref', password='p', referee=self.referee)
        self.home = make_team('Home FC')
        self.away = make_team('Away FC')
        self.stadium = make_stadium()
        self.open_match = Match.objects.create(
            status='expected', home_team=self.home, away_team=self.away,
            referee=self.referee, stadium=self.stadium,
            scheduled_at='2026-07-01T15:00:00',
        )
        self.finished_match = Match.objects.create(
            status='finished', home_team=self.home, away_team=self.away,
            referee=self.referee, stadium=self.stadium,
            scheduled_at='2026-06-01T15:00:00',
            home_score=1, away_score=0, home_fair_play=2, away_fair_play=3,
        )
        # a match for a different referee (should not appear)
        other_ref = Referee.objects.create(first_name='X', last_name='Y', phone='6900000002')
        Match.objects.create(status='expected', referee=other_ref, scheduled_at='2026-07-02T15:00:00')

    def _login(self):
        self.client.post('/app/api/auth/login', json.dumps({'username': 'ref', 'password': 'p'}), content_type='application/json')

    def test_open_matches_requires_auth(self):
        res = self.client.get('/app/api/referee/matches/open')
        self.assertEqual(res.status_code, 401)

    def test_open_matches_requires_referee_role(self):
        player = Player.objects.create(first_name='P', last_name='P')
        AppUser.objects.create(username='p', password='p', player=player)
        self.client.post('/app/api/auth/login', json.dumps({'username': 'p', 'password': 'p'}), content_type='application/json')
        res = self.client.get('/app/api/referee/matches/open')
        self.assertEqual(res.status_code, 403)

    def test_open_matches_returns_only_expected_for_this_referee(self):
        self._login()
        data = self.client.get('/app/api/referee/matches/open').json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['id'], self.open_match.id)
        self.assertEqual(data[0]['status'], 'expected')

    def test_submitted_matches_returns_only_finished_for_this_referee(self):
        self._login()
        data = self.client.get('/app/api/referee/matches/submitted').json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['id'], self.finished_match.id)
        self.assertEqual(data[0]['status'], 'finished')

    def test_open_match_has_correct_team_names(self):
        self._login()
        data = self.client.get('/app/api/referee/matches/open').json()
        self.assertEqual(data[0]['home_team_name'], 'Home FC')
        self.assertEqual(data[0]['away_team_name'], 'Away FC')
        self.assertEqual(data[0]['stadium_name'], 'Main St')


# ── Match endpoint tests ──────────────────────────────────────────────────────

class GetMatchTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.match = make_expected_match()

    def test_returns_match_info(self):
        res = self.client.get(f'/app/api/matches/{self.match.id}')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data['id'], self.match.id)
        self.assertEqual(data['status'], 'expected')

    def test_404_for_missing_match(self):
        res = self.client.get('/app/api/matches/99999')
        self.assertEqual(res.status_code, 404)


class GetMatchPlayersTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.home = make_team('Home FC')
        self.away = make_team('Away FC')
        self.match = make_expected_match(home=self.home, away=self.away)
        Player.objects.create(first_name='Alice', last_name='A', team=self.home)
        Player.objects.create(first_name='Bob', last_name='B', team=self.away)
        Player.objects.create(first_name='Other', last_name='C')

    def test_returns_only_match_team_players(self):
        res = self.client.get(f'/app/api/matches/{self.match.id}/players')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data), 2)
        names = {p['first_name'] for p in data}
        self.assertIn('Alice', names)
        self.assertIn('Bob', names)
        self.assertNotIn('Other', names)


class FinishMatchTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.home = make_team('Home FC')
        self.away = make_team('Away FC')
        self.match = make_expected_match(home=self.home, away=self.away)

    def _post(self, match_id, data):
        return self.client.post(f'/app/api/matches/{match_id}/finish', json.dumps(data), content_type='application/json')

    def test_finish_sets_status_and_scores(self):
        res = self._post(self.match.id, FINISH_OK)
        self.assertEqual(res.status_code, 200)
        self.match.refresh_from_db()
        self.assertEqual(self.match.status, 'finished')
        self.assertEqual(self.match.home_score, 2)
        self.assertEqual(self.match.away_score, 1)

    def test_returns_success_true(self):
        res = self._post(self.match.id, FINISH_OK)
        self.assertTrue(res.json()['success'])

    def test_404_for_missing_match(self):
        res = self._post(99999, FINISH_OK)
        self.assertEqual(res.status_code, 404)

    def test_error_if_not_expected(self):
        self.match.status = 'draft'
        self.match.save()
        res = self._post(self.match.id, FINISH_OK)
        self.assertEqual(res.status_code, 400)

    def test_error_if_already_finished(self):
        self.match.status = 'finished'
        self.match.home_score = 0
        self.match.away_score = 0
        self.match.home_fair_play = 0
        self.match.away_fair_play = 0
        self.match.save()
        res = self._post(self.match.id, FINISH_OK)
        self.assertEqual(res.status_code, 400)

    def test_error_invalid_fair_play(self):
        res = self._post(self.match.id, {**FINISH_OK, 'home_fair_play': 10})
        self.assertEqual(res.status_code, 422)

    def test_error_negative_score(self):
        res = self._post(self.match.id, {**FINISH_OK, 'home_score': -1})
        self.assertEqual(res.status_code, 422)

    def test_goals_are_created(self):
        player = Player.objects.create(first_name='Carlos', last_name='D', team=self.home)
        data = {**FINISH_OK, 'goals': [{'player_id': player.id, 'team_id': self.home.id, 'minute': 30, 'own_goal': False}]}
        self._post(self.match.id, data)
        self.assertEqual(MatchPlayerGoal.objects.filter(match=self.match).count(), 1)

    def test_cards_are_created(self):
        player = Player.objects.create(first_name='Dana', last_name='E', team=self.away)
        data = {**FINISH_OK, 'cards': [{'player_id': player.id, 'team_id': self.away.id, 'card_type': 'yellow', 'minute': 55}]}
        self._post(self.match.id, data)
        self.assertEqual(MatchPlayerCard.objects.filter(match=self.match).count(), 1)

    def test_invalid_card_type_rejected(self):
        player = Player.objects.create(first_name='Eve', last_name='F', team=self.home)
        data = {**FINISH_OK, 'cards': [{'player_id': player.id, 'team_id': self.home.id, 'card_type': 'green', 'minute': 10}]}
        res = self._post(self.match.id, data)
        self.assertEqual(res.status_code, 422)

    def test_comments_saved(self):
        self._post(self.match.id, {**FINISH_OK, 'comments': 'Good match'})
        self.match.refresh_from_db()
        self.assertEqual(self.match.comments, 'Good match')


# ── E2E tests ─────────────────────────────────────────────────────────────────

class E2ERefereeSubmitsForm(TestCase):
    """Full flow: referee logs in, sees open match, submits form, sees it in submitted."""

    def setUp(self):
        self.client = Client()
        self.referee = make_referee()
        self.ref_user = AppUser.objects.create(username='ref_e2e', password='secret', referee=self.referee)
        self.home = make_team('Lions FC')
        self.away = make_team('Tigers FC')
        self.stadium = make_stadium()
        self.match = Match.objects.create(
            status='expected', home_team=self.home, away_team=self.away,
            referee=self.referee, stadium=self.stadium,
            scheduled_at='2026-08-10T18:00:00',
        )

    def test_full_referee_flow(self):
        # 1. Not authenticated — /me returns 401
        self.assertEqual(self.client.get('/app/api/auth/me').status_code, 401)

        # 2. Login
        res = self.client.post('/app/api/auth/login', json.dumps({'username': 'ref_e2e', 'password': 'secret'}), content_type='application/json')
        self.assertEqual(res.status_code, 200)
        me = res.json()
        self.assertTrue(me['is_referee'])

        # 3. Open forms shows the match
        open_res = self.client.get('/app/api/referee/matches/open').json()
        self.assertEqual(len(open_res), 1)
        self.assertEqual(open_res[0]['id'], self.match.id)

        # 4. Submitted is empty
        self.assertEqual(len(self.client.get('/app/api/referee/matches/submitted').json()), 0)

        # 5. Submit the form
        player = Player.objects.create(first_name='Scorer', last_name='X', team=self.home)
        payload = {
            'home_score': 3, 'away_score': 1,
            'home_fair_play': 4, 'away_fair_play': 2,
            'comments': 'Clean game',
            'goals': [{'player_id': player.id, 'team_id': self.home.id, 'minute': 22, 'own_goal': False}],
            'cards': [],
        }
        finish_res = self.client.post(f'/app/api/matches/{self.match.id}/finish', json.dumps(payload), content_type='application/json')
        self.assertEqual(finish_res.status_code, 200)
        self.assertTrue(finish_res.json()['success'])

        # 6. Match is now finished in DB
        self.match.refresh_from_db()
        self.assertEqual(self.match.status, 'finished')
        self.assertEqual(self.match.home_score, 3)
        self.assertEqual(self.match.comments, 'Clean game')

        # 7. Open forms now empty, submitted has the match
        self.assertEqual(len(self.client.get('/app/api/referee/matches/open').json()), 0)
        submitted = self.client.get('/app/api/referee/matches/submitted').json()
        self.assertEqual(len(submitted), 1)
        self.assertEqual(submitted[0]['id'], self.match.id)

        # 8. Goal was recorded
        self.assertEqual(MatchPlayerGoal.objects.filter(match=self.match).count(), 1)


class E2EPlayerCaptainFlow(TestCase):
    """Captain and non-captain see correct roles via /me."""

    def setUp(self):
        self.client = Client()
        self.team = make_team('Spartans')
        self.captain_player = Player.objects.create(first_name='Cap', last_name='Tain', team=self.team)
        self.team.captain = self.captain_player
        self.team.save()
        self.regular_player = Player.objects.create(first_name='Reg', last_name='Ular', team=self.team)

        AppUser.objects.create(username='the_captain', password='pw', player=self.captain_player)
        AppUser.objects.create(username='the_player', password='pw', player=self.regular_player)

    def _login(self, username):
        return self.client.post('/app/api/auth/login', json.dumps({'username': username, 'password': 'pw'}), content_type='application/json').json()

    def test_captain_me(self):
        me = self._login('the_captain')
        self.assertTrue(me['is_player'])
        self.assertTrue(me['is_captain'])
        self.assertEqual(me['team_name'], 'Spartans')

    def test_regular_player_me(self):
        me = self._login('the_player')
        self.assertTrue(me['is_player'])
        self.assertFalse(me['is_captain'])
        self.assertEqual(me['team_name'], 'Spartans')

    def test_captain_can_switch_to_different_team_captain(self):
        # If captain changes, is_captain updates live
        team2 = make_team('Eagles')
        self.team.captain = self.regular_player  # promote regular player
        self.team.save()
        me = self._login('the_captain')
        self.assertFalse(me['is_captain'])  # no longer captain
