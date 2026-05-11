"""
Functional tests for Team workflows.

Multi-step sequences that represent real usage:
create → read → update → delete, captain assignment, roster listing.
"""
import json

from django.test import Client, TestCase

from api.models import Player, Team


class TeamLifecycleTest(TestCase):
    """Full create → read → update → delete lifecycle."""

    def setUp(self):
        self.client = Client()

    def _post(self, data):
        return self.client.post(
            '/api/teams/', json.dumps(data), content_type='application/json'
        )

    def _put(self, tid, data):
        return self.client.put(
            f'/api/teams/{tid}', json.dumps(data), content_type='application/json'
        )

    def test_full_crud_lifecycle(self):
        # 1. Create
        res = self._post({'name': 'Olympiakos', 'is_active': True})
        self.assertEqual(res.status_code, 201)
        tid = res.json()['id']
        self.assertEqual(res.json()['name'], 'Olympiakos')
        self.assertTrue(res.json()['is_active'])

        # 2. Read
        res = self.client.get(f'/api/teams/{tid}')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['name'], 'Olympiakos')

        # 3. Update name
        res = self._put(tid, {'name': 'Olympiakos FC', 'is_active': True})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['name'], 'Olympiakos FC')

        # 4. Appears in list
        res = self.client.get('/api/teams/')
        names = [t['name'] for t in res.json()]
        self.assertIn('Olympiakos FC', names)

        # 5. Delete
        res = self.client.delete(f'/api/teams/{tid}')
        self.assertEqual(res.status_code, 204)

        # 6. Gone
        res = self.client.get('/api/teams/')
        ids = [t['id'] for t in res.json()]
        self.assertNotIn(tid, ids)

    def test_created_team_appears_in_list_with_all_fields(self):
        res = self._post({'name': 'Panathinaikos', 'is_active': True, 'comments': 'Historic club'})
        self.assertEqual(res.status_code, 201)
        tid = res.json()['id']

        list_res = self.client.get('/api/teams/')
        teams = list_res.json()
        created = next((t for t in teams if t['id'] == tid), None)

        self.assertIsNotNone(created)
        self.assertEqual(created['name'], 'Panathinaikos')
        self.assertTrue(created['is_active'])
        self.assertEqual(created['comments'], 'Historic club')

        self.client.delete(f'/api/teams/{tid}')

    def test_deactivate_team(self):
        res = self._post({'name': 'Old Club', 'is_active': True})
        tid = res.json()['id']

        res = self._put(tid, {'name': 'Old Club', 'is_active': False})
        self.assertEqual(res.status_code, 200)
        self.assertFalse(res.json()['is_active'])

        self.client.delete(f'/api/teams/{tid}')

    def test_assign_captain_and_vice(self):
        team = Team.objects.create(name='Captain Club')
        captain = Player.objects.create(first_name='Alpha', last_name='One')
        vice = Player.objects.create(first_name='Beta', last_name='Two')

        res = self._put(team.id, {
            'name': 'Captain Club',
            'is_active': True,
            'captain_id': captain.id,
            'vice_captain_id': vice.id,
        })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['captain_id'], captain.id)
        self.assertEqual(res.json()['vice_captain_id'], vice.id)

        team.delete()
        captain.delete()
        vice.delete()

    def test_clear_captain(self):
        team = Team.objects.create(name='No Captain')
        captain = Player.objects.create(first_name='Cap', last_name='Tain')
        team.captain = captain
        team.save()

        res = self._put(team.id, {'name': 'No Captain', 'is_active': True, 'captain_id': None})
        self.assertIsNone(res.json()['captain_id'])

        team.delete()
        captain.delete()

    def test_search_after_bulk_create(self):
        names = ['Alpha United', 'Beta City', 'Gamma Athletic']
        ids = []
        for name in names:
            r = self._post({'name': name, 'is_active': True})
            ids.append(r.json()['id'])

        res = self.client.get('/api/teams/?search=beta')
        self.assertEqual(len(res.json()), 1)
        self.assertEqual(res.json()[0]['name'], 'Beta City')

        for tid in ids:
            self.client.delete(f'/api/teams/{tid}')

    def test_players_filtered_by_team_id(self):
        """The player list endpoint filters by team_id — used by the frontend roster view."""
        team = Team.objects.create(name='Roster FC')
        p1 = Player.objects.create(first_name='Alice', last_name='A', team=team)
        p2 = Player.objects.create(first_name='Bob', last_name='B', team=team)
        p3 = Player.objects.create(first_name='Carol', last_name='C')  # no team

        res = self.client.get(f'/api/players/?team_id={team.id}')
        self.assertEqual(res.status_code, 200)
        ids = [p['id'] for p in res.json()]
        self.assertIn(p1.id, ids)
        self.assertIn(p2.id, ids)
        self.assertNotIn(p3.id, ids)

        team.delete()
        p1.delete()
        p2.delete()
        p3.delete()
