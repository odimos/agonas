import json

from django.test import Client, TestCase

from api.models import Match, MatchPlayerGoal, Player, Referee, Stadium, Team


def make_teams():
    home = Team.objects.create(name='GoalHome FC')
    away = Team.objects.create(name='GoalAway FC')
    return home, away


def make_finished_match(home, away):
    ref = Referee.objects.create(first_name='GRef', last_name='One', phone='6900000002')
    sta = Stadium.objects.create(name='StadB', phone='2100000002', address='Addr 2')
    return Match.objects.create(
        status='finished',
        home_team=home, away_team=away,
        referee=ref, stadium=sta,
        scheduled_at='2026-06-01T15:00:00+00:00',
        home_score=2, away_score=1,
        home_fair_play=0, away_fair_play=0,
    )


def make_player(team, first='Jane', last='Smith'):
    return Player.objects.create(first_name=first, last_name=last, team=team)


class MatchPlayerGoalListTest(TestCase):
    def setUp(self):
        self.client = Client()
        home, away = make_teams()
        self.match = make_finished_match(home, away)
        self.player = make_player(home)
        MatchPlayerGoal.objects.create(
            player=self.player, match=self.match, team=home, minute=30,
        )

    def test_list_returns_200(self):
        res = self.client.get('/api/match-player-goals/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()), 1)

    def test_filter_by_match_id(self):
        res = self.client.get(f'/api/match-player-goals/?match_id={self.match.id}')
        self.assertEqual(len(res.json()), 1)

    def test_filter_by_wrong_match_returns_empty(self):
        res = self.client.get('/api/match-player-goals/?match_id=99999')
        self.assertEqual(res.json(), [])


class MatchPlayerGoalCreateTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.home, self.away = make_teams()
        self.match = make_finished_match(self.home, self.away)
        self.player = make_player(self.home)

    def _post(self, data):
        return self.client.post(
            '/api/match-player-goals/', json.dumps(data), content_type='application/json',
        )

    def valid(self, **overrides):
        return {
            'player_id': self.player.id,
            'match_id': self.match.id,
            'team_id': self.home.id,
            'own_goal': False,
            'minute': 60,
            **overrides,
        }

    def test_create_goal_returns_201(self):
        res = self._post(self.valid())
        self.assertEqual(res.status_code, 201)
        self.assertFalse(res.json()['own_goal'])
        self.assertEqual(res.json()['team_id'], self.home.id)

    def test_create_own_goal_returns_201(self):
        res = self._post(self.valid(own_goal=True))
        self.assertEqual(res.status_code, 201)
        self.assertTrue(res.json()['own_goal'])

    def test_minute_out_of_range_returns_422(self):
        res = self._post(self.valid(minute=131))
        self.assertEqual(res.status_code, 422)

    def test_minute_130_is_valid(self):
        res = self._post(self.valid(minute=130))
        self.assertEqual(res.status_code, 201)

    def test_missing_team_id_returns_422(self):
        data = self.valid()
        del data['team_id']
        res = self._post(data)
        self.assertEqual(res.status_code, 422)

    def test_team_not_in_match_returns_422(self):
        other_team = Team.objects.create(name='Other FC')
        res = self._post(self.valid(team_id=other_team.id))
        self.assertEqual(res.status_code, 422)

    def test_player_not_in_specified_team_returns_422(self):
        # player is in home, but we pass away team id
        res = self._post(self.valid(team_id=self.away.id))
        self.assertEqual(res.status_code, 422)

    def test_away_team_player_is_valid(self):
        away_player = make_player(self.away, 'Away', 'Scorer')
        res = self._post(self.valid(player_id=away_player.id, team_id=self.away.id))
        self.assertEqual(res.status_code, 201)

    def test_missing_player_id_returns_422(self):
        data = self.valid()
        del data['player_id']
        res = self._post(data)
        self.assertEqual(res.status_code, 422)


class MatchPlayerGoalDeleteTest(TestCase):
    def setUp(self):
        self.client = Client()
        home, away = make_teams()
        self.match = make_finished_match(home, away)
        self.player = make_player(home)
        self.goal = MatchPlayerGoal.objects.create(
            player=self.player, match=self.match, team=home, minute=75,
        )

    def test_delete_returns_204(self):
        res = self.client.delete(f'/api/match-player-goals/{self.goal.id}')
        self.assertEqual(res.status_code, 204)
        self.assertFalse(MatchPlayerGoal.objects.filter(id=self.goal.id).exists())

    def test_delete_not_found_returns_404(self):
        res = self.client.delete('/api/match-player-goals/99999')
        self.assertEqual(res.status_code, 404)
