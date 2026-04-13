import json

from django.test import Client, TestCase

from api.models import Team

VALID = {'name': 'Alpha FC', 'is_active': True}


class TeamListTest(TestCase):
    def setUp(self):
        self.client = Client()
        Team.objects.create(**VALID)

    def test_returns_200(self):
        res = self.client.get('/api/teams/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()), 1)

    def test_search_by_name(self):
        Team.objects.create(name='Beta FC', is_active=True)
        res = self.client.get('/api/teams/?search=alpha')
        self.assertEqual(len(res.json()), 1)
        self.assertEqual(res.json()[0]['name'], 'Alpha FC')


class TeamCreateTest(TestCase):
    def setUp(self):
        self.client = Client()

    def _post(self, data):
        return self.client.post('/api/teams/', json.dumps(data), content_type='application/json')

    def test_valid_returns_201(self):
        res = self._post(VALID)
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json()['name'], 'Alpha FC')

    def test_missing_name_returns_422(self):
        res = self._post({'is_active': True})
        self.assertEqual(res.status_code, 422)

    def test_blank_name_returns_422(self):
        res = self._post({'name': '   ', 'is_active': True})
        self.assertEqual(res.status_code, 422)

    def test_trims_whitespace(self):
        res = self._post({'name': '  Alpha FC  ', 'is_active': True})
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json()['name'], 'Alpha FC')


class TeamRetrieveUpdateDeleteTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.team = Team.objects.create(**VALID)

    def _put(self, data):
        return self.client.put(
            f'/api/teams/{self.team.id}',
            json.dumps(data), content_type='application/json',
        )

    def test_get_existing(self):
        res = self.client.get(f'/api/teams/{self.team.id}')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['name'], 'Alpha FC')

    def test_get_not_found(self):
        self.assertEqual(self.client.get('/api/teams/99999').status_code, 404)

    def test_update(self):
        res = self._put({**VALID, 'name': 'Alpha United'})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['name'], 'Alpha United')

    def test_delete(self):
        res = self.client.delete(f'/api/teams/{self.team.id}')
        self.assertEqual(res.status_code, 204)
        self.assertFalse(Team.objects.filter(id=self.team.id).exists())
