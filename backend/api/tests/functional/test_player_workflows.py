"""
Functional tests for Player workflows.

These test complete multi-step sequences representing real usage,
e.g. "create a player, assign a team, update, search, delete".
"""
import json

from django.test import Client, TestCase

from api.models import Player, Team


class PlayerLifecycleTest(TestCase):
    """Full create → read → update → delete lifecycle."""

    def setUp(self):
        self.client = Client()

    def _post(self, data):
        return self.client.post(
            '/api/players/', json.dumps(data), content_type='application/json'
        )

    def _put(self, pid, data):
        return self.client.put(
            f'/api/players/{pid}', json.dumps(data), content_type='application/json'
        )

    def test_full_crud_lifecycle(self):
        # 1. Create
        res = self._post({'first_name': 'Nikos', 'last_name': 'Papadopoulos'})
        self.assertEqual(res.status_code, 201)
        pid = res.json()['id']

        # 2. Read
        res = self.client.get(f'/api/players/{pid}')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['first_name'], 'Nikos')

        # 3. Update
        res = self._put(pid, {
            'first_name': 'Nikos', 'last_name': 'Papadopoulos',
            'nickname': 'NikosPap', 'phone': '6911234567',
            'email': 'nikos.pap@test.gr',
        })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['nickname'], 'NikosPap')
        self.assertEqual(res.json()['email'], 'nikos.pap@test.gr')

        # 4. Appears in list
        res = self.client.get('/api/players/')
        names = [p['first_name'] for p in res.json()]
        self.assertIn('Nikos', names)

        # 5. Delete
        res = self.client.delete(f'/api/players/{pid}')
        self.assertEqual(res.status_code, 204)

        # 6. Gone from list
        res = self.client.get('/api/players/')
        ids = [p['id'] for p in res.json()]
        self.assertNotIn(pid, ids)

    def test_create_with_team_and_verify_in_list(self):
        team = Team.objects.create(name='Olympiakos')

        res = self._post({
            'first_name': 'Kostas', 'last_name': 'Fortounis', 'team_id': team.id
        })
        self.assertEqual(res.status_code, 201)
        pid = res.json()['id']
        self.assertEqual(res.json()['team_id'], team.id)

        # Verify team assignment in list
        list_res = self.client.get('/api/players/')
        players = list_res.json()
        created = next(p for p in players if p['id'] == pid)
        self.assertEqual(created['team_id'], team.id)

        self.client.delete(f'/api/players/{pid}')
        team.delete()

    def test_reassign_team_then_clear(self):
        team_a = Team.objects.create(name='Team A')
        team_b = Team.objects.create(name='Team B')
        player = Player.objects.create(first_name='Move', last_name='Me', team=team_a)

        # Assign to team_b
        res = self._put(player.id, {'first_name': 'Move', 'last_name': 'Me', 'team_id': team_b.id})
        self.assertEqual(res.json()['team_id'], team_b.id)

        # Clear team
        res = self._put(player.id, {'first_name': 'Move', 'last_name': 'Me', 'team_id': None})
        self.assertIsNone(res.json()['team_id'])

        player.delete()
        team_a.delete()
        team_b.delete()

    def test_search_after_bulk_create(self):
        names = [('Alpha', 'A'), ('Beta', 'B'), ('Gamma', 'C')]
        ids = []
        for first, last in names:
            res = self._post({'first_name': first, 'last_name': last})
            ids.append(res.json()['id'])

        res = self.client.get('/api/players/?search=beta')
        self.assertEqual(len(res.json()), 1)
        self.assertEqual(res.json()[0]['first_name'], 'Beta')

        # cleanup
        for pid in ids:
            self.client.delete(f'/api/players/{pid}')

    def test_created_player_appears_in_list(self):
        """Verify the exact flow: POST → GET list → player present with all fields."""
        payload = {
            'first_name': 'Giorgos',
            'last_name': 'Giakoumakis',
            'nickname': 'GG',
            'phone': '6900000001',
            'email': 'gg@celtic.com',
        }
        res = self._post(payload)
        self.assertEqual(res.status_code, 201)
        pid = res.json()['id']

        list_res = self.client.get('/api/players/')
        self.assertEqual(list_res.status_code, 200)
        players = list_res.json()
        created = next((p for p in players if p['id'] == pid), None)

        self.assertIsNotNone(created, 'Created player not found in list')
        self.assertEqual(created['first_name'], 'Giorgos')
        self.assertEqual(created['last_name'], 'Giakoumakis')
        self.assertEqual(created['nickname'], 'GG')
        self.assertEqual(created['phone'], '6900000001')
        self.assertEqual(created['email'], 'gg@celtic.com')

        # cleanup
        self.client.delete(f'/api/players/{pid}')
