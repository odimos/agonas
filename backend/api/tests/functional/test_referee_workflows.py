"""
Functional tests for Referee workflows.

These test complete multi-step sequences that represent real user actions,
e.g. "create a referee then edit it" rather than individual endpoints.
"""
import json

from django.test import Client, TestCase

from api.models import Referee


class RefereeLifecycleTest(TestCase):
    """Full create → read → update → delete lifecycle."""

    def setUp(self):
        self.client = Client()

    def _post(self, data):
        return self.client.post(
            '/api/referees/', json.dumps(data), content_type='application/json'
        )

    def _put(self, rid, data):
        return self.client.put(
            f'/api/referees/{rid}', json.dumps(data), content_type='application/json'
        )

    def test_full_crud_lifecycle(self):
        # 1. Create
        res = self._post({'first_name': 'Alice', 'last_name': 'Jones', 'phone': '6911111111'})
        self.assertEqual(res.status_code, 201)
        rid = res.json()['id']

        # 2. Read
        res = self.client.get(f'/api/referees/{rid}')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['first_name'], 'Alice')

        # 3. Update
        res = self._put(rid, {
            'first_name': 'Alice', 'last_name': 'Jones',
            'phone': '6911111111', 'email': 'alice@mail.com'
        })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['email'], 'alice@mail.com')

        # 4. Appears in list
        res = self.client.get('/api/referees/')
        names = [r['first_name'] for r in res.json()]
        self.assertIn('Alice', names)

        # 5. Delete
        res = self.client.delete(f'/api/referees/{rid}')
        self.assertEqual(res.status_code, 204)

        # 6. Gone from list
        res = self.client.get('/api/referees/')
        self.assertEqual(len(res.json()), 0)

    def test_search_after_bulk_create(self):
        names = [('Alpha', 'A'), ('Beta', 'B'), ('Gamma', 'C')]
        for first, last in names:
            self._post({'first_name': first, 'last_name': last, 'phone': '6900'})

        res = self.client.get('/api/referees/?search=beta')
        self.assertEqual(len(res.json()), 1)
        self.assertEqual(res.json()[0]['first_name'], 'Beta')
