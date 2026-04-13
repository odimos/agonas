"""
Integration tests for the Referees API.

Each test exercises a full HTTP request → view → database round-trip
using Django's test client and an isolated test database.
"""
import json

from django.test import Client, TestCase

from api.models import Referee


class RefereeListTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.referee = Referee.objects.create(
            first_name='John', last_name='Smith',
            phone='6999999999', email='john@mail.com'
        )

    def test_returns_200_with_all_referees(self):
        res = self.client.get('/api/referees/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()), 1)

    def test_search_by_first_name(self):
        Referee.objects.create(first_name='Mike', last_name='Brown', phone='6988')
        res = self.client.get('/api/referees/?search=john')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()), 1)
        self.assertEqual(res.json()[0]['first_name'], 'John')

    def test_search_by_last_name(self):
        res = self.client.get('/api/referees/?search=smith')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()), 1)

    def test_search_no_match_returns_empty(self):
        res = self.client.get('/api/referees/?search=zzz')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()), 0)


class RefereeCreateTest(TestCase):
    def setUp(self):
        self.client = Client()

    def _post(self, data):
        return self.client.post(
            '/api/referees/', json.dumps(data), content_type='application/json'
        )

    def test_valid_payload_returns_201(self):
        res = self._post({'first_name': 'Jane', 'last_name': 'Doe', 'phone': '6900000000'})
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json()['first_name'], 'Jane')

    def test_created_referee_persisted(self):
        self._post({'first_name': 'Jane', 'last_name': 'Doe', 'phone': '6900000000'})
        self.assertTrue(Referee.objects.filter(first_name='Jane').exists())

    def test_missing_required_field_returns_422(self):
        res = self._post({'first_name': 'Jane', 'last_name': 'Doe'})
        self.assertEqual(res.status_code, 422)

    def test_blank_required_field_returns_422(self):
        res = self._post({'first_name': '   ', 'last_name': 'Doe', 'phone': '6900'})
        self.assertEqual(res.status_code, 422)

    def test_whitespace_is_trimmed(self):
        res = self._post({'first_name': '  Jane  ', 'last_name': '  Doe  ', 'phone': '  6900  '})
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json()['first_name'], 'Jane')
        self.assertEqual(res.json()['phone'], '6900')


class RefereeRetrieveTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.referee = Referee.objects.create(
            first_name='John', last_name='Smith', phone='6999999999'
        )

    def test_existing_referee_returns_200(self):
        res = self.client.get(f'/api/referees/{self.referee.id}')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['last_name'], 'Smith')

    def test_nonexistent_referee_returns_404(self):
        res = self.client.get('/api/referees/99999')
        self.assertEqual(res.status_code, 404)


class RefereeUpdateTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.referee = Referee.objects.create(
            first_name='John', last_name='Smith', phone='6999999999'
        )

    def _put(self, url, data):
        return self.client.put(url, json.dumps(data), content_type='application/json')

    def test_valid_update_returns_200(self):
        res = self._put(f'/api/referees/{self.referee.id}', {
            'first_name': 'John', 'last_name': 'Smith',
            'phone': '6999999999', 'email': 'new@mail.com'
        })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['email'], 'new@mail.com')

    def test_update_persisted_to_db(self):
        self._put(f'/api/referees/{self.referee.id}', {
            'first_name': 'John', 'last_name': 'Updated', 'phone': '6999999999'
        })
        self.referee.refresh_from_db()
        self.assertEqual(self.referee.last_name, 'Updated')

    def test_nonexistent_referee_returns_404(self):
        res = self._put('/api/referees/99999', {
            'first_name': 'X', 'last_name': 'Y', 'phone': '000'
        })
        self.assertEqual(res.status_code, 404)


class RefereeDeleteTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.referee = Referee.objects.create(
            first_name='John', last_name='Smith', phone='6999999999'
        )

    def test_delete_existing_returns_204(self):
        res = self.client.delete(f'/api/referees/{self.referee.id}')
        self.assertEqual(res.status_code, 204)

    def test_delete_removes_from_db(self):
        self.client.delete(f'/api/referees/{self.referee.id}')
        self.assertFalse(Referee.objects.filter(id=self.referee.id).exists())

    def test_delete_nonexistent_returns_404(self):
        res = self.client.delete('/api/referees/99999')
        self.assertEqual(res.status_code, 404)
