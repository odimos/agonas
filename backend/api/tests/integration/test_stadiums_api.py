import json

from django.test import Client, TestCase

from api.models import Stadium

VALID = {'name': 'Olympic', 'phone': '2100000000', 'address': 'Athens'}


class StadiumListTest(TestCase):
    def setUp(self):
        self.client = Client()
        Stadium.objects.create(**VALID)

    def test_returns_200(self):
        res = self.client.get('/api/stadiums/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()), 1)

    def test_search_by_name(self):
        Stadium.objects.create(name='Karaiskakis', phone='2100000001', address='Piraeus')
        res = self.client.get('/api/stadiums/?search=olympic')
        self.assertEqual(len(res.json()), 1)
        self.assertEqual(res.json()[0]['name'], 'Olympic')


class StadiumCreateTest(TestCase):
    def setUp(self):
        self.client = Client()

    def _post(self, data):
        return self.client.post('/api/stadiums/', json.dumps(data), content_type='application/json')

    def test_valid_returns_201(self):
        res = self._post(VALID)
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json()['name'], 'Olympic')

    def test_missing_required_returns_422(self):
        res = self._post({'name': 'Olympic', 'phone': '2100'})  # missing address
        self.assertEqual(res.status_code, 422)

    def test_blank_required_returns_422(self):
        res = self._post({'name': '  ', 'phone': '2100', 'address': 'Athens'})
        self.assertEqual(res.status_code, 422)

    def test_negative_cost_returns_422(self):
        res = self._post({**VALID, 'cost': '-10.00'})
        self.assertEqual(res.status_code, 422)

    def test_invalid_url_returns_422(self):
        res = self._post({**VALID, 'map_url': 'not-a-url'})
        self.assertEqual(res.status_code, 422)

    def test_valid_url_accepted(self):
        res = self._post({**VALID, 'map_url': 'https://maps.google.com'})
        self.assertEqual(res.status_code, 201)


class StadiumRetrieveUpdateDeleteTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.stadium = Stadium.objects.create(**VALID)

    def _put(self, data):
        return self.client.put(
            f'/api/stadiums/{self.stadium.id}',
            json.dumps(data), content_type='application/json'
        )

    def test_get_existing(self):
        res = self.client.get(f'/api/stadiums/{self.stadium.id}')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['name'], 'Olympic')

    def test_get_not_found(self):
        self.assertEqual(self.client.get('/api/stadiums/99999').status_code, 404)

    def test_update(self):
        res = self._put({**VALID, 'name': 'Updated'})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['name'], 'Updated')

    def test_delete(self):
        res = self.client.delete(f'/api/stadiums/{self.stadium.id}')
        self.assertEqual(res.status_code, 204)
        self.assertFalse(Stadium.objects.filter(id=self.stadium.id).exists())
