import json

from django.test import Client, TestCase

from api.models import Match, MatchPlayerCard, Player, Referee, Stadium, Team


def make_teams():
    home = Team.objects.create(name='Home FC')
    away = Team.objects.create(name='Away FC')
    return home, away


def make_finished_match(home, away):
    ref = Referee.objects.create(first_name='Ref', last_name='One', phone='6900000001')
    sta = Stadium.objects.create(name='StadA', phone='2100000001', address='Addr 1')
    return Match.objects.create(
        status='finished',
        home_team=home, away_team=away,
        referee=ref, stadium=sta,
        scheduled_at='2026-06-01T15:00:00+00:00',
        home_score=2, away_score=1,
        home_fair_play=0, away_fair_play=0,
    )


def make_player(team, first='John', last='Doe'):
    return Player.objects.create(first_name=first, last_name=last, team=team)


class MatchPlayerCardListTest(TestCase):
    def setUp(self):
        self.client = Client()
        home, away = make_teams()
        self.match = make_finished_match(home, away)
        self.player = make_player(home)
        MatchPlayerCard.objects.create(
            player=self.player, match=self.match, team=home, card_type='yellow', minute=45,
        )

    def test_list_returns_200(self):
        res = self.client.get('/api/match-player-cards/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()), 1)

    def test_filter_by_match_id(self):
        res = self.client.get(f'/api/match-player-cards/?match_id={self.match.id}')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()), 1)

    def test_filter_by_wrong_match_returns_empty(self):
        res = self.client.get('/api/match-player-cards/?match_id=99999')
        self.assertEqual(res.json(), [])


class MatchPlayerCardCreateTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.home, self.away = make_teams()
        self.match = make_finished_match(self.home, self.away)
        self.player = make_player(self.home)

    def _post(self, data):
        return self.client.post(
            '/api/match-player-cards/', json.dumps(data), content_type='application/json',
        )

    def valid(self, **overrides):
        return {
            'player_id': self.player.id,
            'match_id': self.match.id,
            'team_id': self.home.id,
            'card_type': 'yellow',
            'minute': 45,
            **overrides,
        }

    def test_create_yellow_card_returns_201(self):
        res = self._post(self.valid())
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json()['card_type'], 'yellow')
        self.assertEqual(res.json()['team_id'], self.home.id)

    def test_create_red_card_returns_201(self):
        res = self._post(self.valid(card_type='red'))
        self.assertEqual(res.status_code, 201)

    def test_invalid_card_type_returns_422(self):
        res = self._post(self.valid(card_type='blue'))
        self.assertEqual(res.status_code, 422)

    def test_minute_out_of_range_returns_422(self):
        res = self._post(self.valid(minute=131))
        self.assertEqual(res.status_code, 422)

    def test_minute_zero_is_valid(self):
        res = self._post(self.valid(minute=0))
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
        # player is in home, but we pass away team
        res = self._post(self.valid(team_id=self.away.id))
        self.assertEqual(res.status_code, 422)

    def test_away_team_player_is_valid(self):
        away_player = make_player(self.away, 'Away', 'Player')
        res = self._post(self.valid(player_id=away_player.id, team_id=self.away.id))
        self.assertEqual(res.status_code, 201)


class MatchPlayerCardDeleteTest(TestCase):
    def setUp(self):
        self.client = Client()
        home, away = make_teams()
        self.match = make_finished_match(home, away)
        self.player = make_player(home)
        self.card = MatchPlayerCard.objects.create(
            player=self.player, match=self.match, team=home, card_type='yellow', minute=30,
        )

    def test_delete_returns_204(self):
        res = self.client.delete(f'/api/match-player-cards/{self.card.id}')
        self.assertEqual(res.status_code, 204)
        self.assertFalse(MatchPlayerCard.objects.filter(id=self.card.id).exists())

    def test_delete_not_found_returns_404(self):
        res = self.client.delete('/api/match-player-cards/99999')
        self.assertEqual(res.status_code, 404)
