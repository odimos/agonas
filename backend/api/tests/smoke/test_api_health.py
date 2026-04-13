"""
Smoke tests — fast sanity checks that critical endpoints respond at all.

These are the first tests to run in CI. If they fail, something is
fundamentally broken (routing, server config, DB connection).
"""
from django.test import Client, TestCase


class APISmokeTest(TestCase):
    def setUp(self):
        self.client = Client()

    def test_root_endpoint_reachable(self):
        res = self.client.get('/api/')
        self.assertEqual(res.status_code, 200)

    def test_referees_endpoint_reachable(self):
        res = self.client.get('/api/referees/')
        self.assertEqual(res.status_code, 200)

    def test_admin_reachable(self):
        res = self.client.get('/admin/')
        # 200 (login page) or 302 (redirect to login) — either means it's up
        self.assertIn(res.status_code, [200, 302])
