"""
Functional tests for Stadium workflows.
"""
import json

from django.test import Client, TestCase

from api.models import Stadium

VALID = {'name': 'Test Arena', 'phone': '2100000001', 'address': '1 Main St'}


class StadiumLifecycleTest(TestCase):

    def setUp(self):
        self.client = Client()

    def _post(self, data):
        return self.client.post(
            '/api/stadiums/', json.dumps({**VALID, **data}), content_type='application/json'
        )

    def _put(self, sid, data):
        return self.client.put(
            f'/api/stadiums/{sid}', json.dumps({**VALID, **data}), content_type='application/json'
        )

    def test_full_crud_lifecycle(self):
        res = self._post({})
        self.assertEqual(res.status_code, 201)
        sid = res.json()['id']
        self.assertIn('created_at', res.json())

        res = self.client.get(f'/api/stadiums/{sid}')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['name'], 'Test Arena')

        res = self._put(sid, {'name': 'Updated Arena'})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['name'], 'Updated Arena')

        res = self.client.get('/api/stadiums/')
        names = [s['name'] for s in res.json()]
        self.assertIn('Updated Arena', names)

        res = self.client.delete(f'/api/stadiums/{sid}')
        self.assertEqual(res.status_code, 204)

        res = self.client.get('/api/stadiums/')
        ids = [s['id'] for s in res.json()]
        self.assertNotIn(sid, ids)

    def test_created_stadium_appears_in_list_with_all_fields(self):
        res = self._post({'email': 'arena@test.com', 'cost': '350.00'})
        self.assertEqual(res.status_code, 201)
        sid = res.json()['id']

        list_res = self.client.get('/api/stadiums/')
        created = next((s for s in list_res.json() if s['id'] == sid), None)
        self.assertIsNotNone(created)
        self.assertEqual(created['name'], 'Test Arena')
        self.assertEqual(created['email'], 'arena@test.com')
        self.assertIn('created_at', created)

        self.client.delete(f'/api/stadiums/{sid}')

    def test_search_by_name(self):
        ids = []
        for name in ['Zeta Stadium', 'Alpha Ground', 'Beta Field']:
            res = self._post({'name': name})
            ids.append(res.json()['id'])

        res = self.client.get('/api/stadiums/?search=alpha')
        self.assertEqual(len(res.json()), 1)
        self.assertEqual(res.json()[0]['name'], 'Alpha Ground')

        for sid in ids:
            self.client.delete(f'/api/stadiums/{sid}')

    def test_ordering_by_name(self):
        ids = []
        for name in ['Zeta', 'Alpha', 'Mike']:
            res = self._post({'name': name})
            ids.append(res.json()['id'])

        res = self.client.get('/api/stadiums/?ordering=name')
        names = [s['name'] for s in res.json() if s['id'] in ids]
        self.assertEqual(names, sorted(names))

        for sid in ids:
            self.client.delete(f'/api/stadiums/{sid}')

    def test_cost_stored_correctly(self):
        res = self._post({'cost': '450.00'})
        sid = res.json()['id']
        self.assertEqual(res.json()['cost'], '450.00')
        self.client.delete(f'/api/stadiums/{sid}')
