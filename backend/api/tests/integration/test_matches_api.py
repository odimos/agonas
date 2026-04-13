import json

from django.test import Client, TestCase

from api.models import Match, Team, Referee, Stadium


def make_team(name='Team A'):
    return Team.objects.create(name=name)


def make_referee():
    return Referee.objects.create(first_name='John', last_name='Ref', phone='6900000001')


def make_stadium():
    return Stadium.objects.create(name='Main St', phone='2100000001', address='Addr 1')


DRAFT = {'status': 'draft'}
SCHEDULED_AT = '2026-06-01T15:00:00'


class MatchListTest(TestCase):
    def setUp(self):
        self.client = Client()
        Match.objects.create(status='draft')

    def test_returns_200(self):
        res = self.client.get('/api/matches/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()), 1)

    def test_search_by_team_name(self):
        t1 = make_team('Alpha FC')
        t2 = make_team('Beta FC')
        Match.objects.create(status='draft', home_team=t1, away_team=t2)
        res = self.client.get('/api/matches/?search=alpha')
        data = res.json()
        self.assertEqual(len(data), 1)


class MatchCreateTest(TestCase):
    def setUp(self):
        self.client = Client()

    def _post(self, data):
        return self.client.post('/api/matches/', json.dumps(data), content_type='application/json')

    def test_create_draft_returns_201(self):
        res = self._post(DRAFT)
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json()['status'], 'draft')

    def test_invalid_status_returns_422(self):
        res = self._post({'status': 'unknown'})
        self.assertEqual(res.status_code, 422)

    def test_missing_status_returns_422(self):
        res = self._post({})
        self.assertEqual(res.status_code, 422)

    def test_create_expected_valid(self):
        t1 = make_team('Home')
        t2 = make_team('Away')
        ref = make_referee()
        sta = make_stadium()
        res = self._post({
            'status': 'expected',
            'home_team_id': t1.id,
            'away_team_id': t2.id,
            'referee_id': ref.id,
            'stadium_id': sta.id,
            'scheduled_at': SCHEDULED_AT,
        })
        self.assertEqual(res.status_code, 201)

    def test_create_expected_same_teams_returns_422(self):
        t = make_team()
        ref = make_referee()
        sta = make_stadium()
        res = self._post({
            'status': 'expected',
            'home_team_id': t.id,
            'away_team_id': t.id,
            'referee_id': ref.id,
            'stadium_id': sta.id,
            'scheduled_at': SCHEDULED_AT,
        })
        self.assertEqual(res.status_code, 422)

    def test_create_expected_missing_required_returns_422(self):
        t1 = make_team('H')
        t2 = make_team('A')
        # missing referee, stadium, scheduled_at
        res = self._post({'status': 'expected', 'home_team_id': t1.id, 'away_team_id': t2.id})
        self.assertEqual(res.status_code, 422)

    def test_create_expected_with_score_returns_422(self):
        t1 = make_team('H2')
        t2 = make_team('A2')
        ref = make_referee()
        sta = make_stadium()
        res = self._post({
            'status': 'expected',
            'home_team_id': t1.id, 'away_team_id': t2.id,
            'referee_id': ref.id, 'stadium_id': sta.id,
            'scheduled_at': SCHEDULED_AT,
            'home_score': 1,
        })
        self.assertEqual(res.status_code, 422)

    def test_create_finished_valid(self):
        t1 = make_team('FH')
        t2 = make_team('FA')
        ref = make_referee()
        sta = make_stadium()
        res = self._post({
            'status': 'finished',
            'home_team_id': t1.id, 'away_team_id': t2.id,
            'referee_id': ref.id, 'stadium_id': sta.id,
            'scheduled_at': SCHEDULED_AT,
            'home_score': 2, 'away_score': 1,
            'home_fair_play': 0, 'away_fair_play': -1,
        })
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json()['home_score'], 2)

    def test_create_finished_negative_score_returns_422(self):
        t1 = make_team('NH')
        t2 = make_team('NA')
        ref = make_referee()
        sta = make_stadium()
        res = self._post({
            'status': 'finished',
            'home_team_id': t1.id, 'away_team_id': t2.id,
            'referee_id': ref.id, 'stadium_id': sta.id,
            'scheduled_at': SCHEDULED_AT,
            'home_score': -1, 'away_score': 1,
            'home_fair_play': 0, 'away_fair_play': 0,
        })
        self.assertEqual(res.status_code, 422)

    def test_create_finished_fair_play_out_of_range_returns_422(self):
        t1 = make_team('FPH')
        t2 = make_team('FPA')
        ref = make_referee()
        sta = make_stadium()
        res = self._post({
            'status': 'finished',
            'home_team_id': t1.id, 'away_team_id': t2.id,
            'referee_id': ref.id, 'stadium_id': sta.id,
            'scheduled_at': SCHEDULED_AT,
            'home_score': 1, 'away_score': 0,
            'home_fair_play': 10, 'away_fair_play': 0,
        })
        self.assertEqual(res.status_code, 422)


class MatchRetrieveUpdateDeleteTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.match = Match.objects.create(status='draft')

    def _put(self, data):
        return self.client.put(
            f'/api/matches/{self.match.id}',
            json.dumps(data), content_type='application/json',
        )

    def test_get_existing(self):
        res = self.client.get(f'/api/matches/{self.match.id}')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'draft')

    def test_get_not_found(self):
        self.assertEqual(self.client.get('/api/matches/99999').status_code, 404)

    def test_update_status(self):
        res = self._put({'status': 'canceled'})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['status'], 'canceled')

    def test_delete(self):
        res = self.client.delete(f'/api/matches/{self.match.id}')
        self.assertEqual(res.status_code, 204)
        self.assertFalse(Match.objects.filter(id=self.match.id).exists())
