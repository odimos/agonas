import json

from django.test import Client, TestCase

from api.models import Player

VALID = {'first_name': 'John', 'last_name': 'Doe'}


class PlayerListTest(TestCase):
    def setUp(self):
        self.client = Client()
        Player.objects.create(**VALID)

    def test_returns_200(self):
        res = self.client.get('/api/players/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()), 1)

    def test_search_by_first_name(self):
        Player.objects.create(first_name='Jane', last_name='Smith')
        res = self.client.get('/api/players/?search=john')
        self.assertEqual(len(res.json()), 1)
        self.assertEqual(res.json()[0]['first_name'], 'John')


class PlayerCreateTest(TestCase):
    def setUp(self):
        self.client = Client()

    def _post(self, data):
        return self.client.post('/api/players/', json.dumps(data), content_type='application/json')

    def test_valid_returns_201(self):
        res = self._post(VALID)
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json()['first_name'], 'John')

    def test_missing_required_returns_422(self):
        res = self._post({'first_name': 'John'})
        self.assertEqual(res.status_code, 422)

    def test_blank_required_returns_422(self):
        res = self._post({'first_name': '  ', 'last_name': 'Doe'})
        self.assertEqual(res.status_code, 422)

    def test_trims_whitespace(self):
        res = self._post({'first_name': '  John  ', 'last_name': '  Doe  '})
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json()['first_name'], 'John')


class PlayerRetrieveUpdateDeleteTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.player = Player.objects.create(**VALID)

    def _put(self, data):
        return self.client.put(
            f'/api/players/{self.player.id}',
            json.dumps(data), content_type='application/json'
        )

    def test_get_existing(self):
        res = self.client.get(f'/api/players/{self.player.id}')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['last_name'], 'Doe')

    def test_get_not_found(self):
        self.assertEqual(self.client.get('/api/players/99999').status_code, 404)

    def test_update(self):
        res = self._put({**VALID, 'nickname': 'JD'})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['nickname'], 'JD')

    def test_delete(self):
        res = self.client.delete(f'/api/players/{self.player.id}')
        self.assertEqual(res.status_code, 204)
        self.assertFalse(Player.objects.filter(id=self.player.id).exists())
