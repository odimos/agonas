from django.test import TestCase

from api.models import Stadium


class StadiumStrTest(TestCase):
    def test_str_returns_name(self):
        s = Stadium(name='Olympic', phone='2100000000', address='Athens')
        self.assertEqual(str(s), 'Olympic')


class StadiumTrimTest(TestCase):
    def test_trims_all_fields_on_save(self):
        s = Stadium.objects.create(
            name='  Olympic  ', phone='  2100  ', address='  Athens  ',
            email='  s@s.com  ', map_url='  https://maps.google.com  '
        )
        self.assertEqual(s.name, 'Olympic')
        self.assertEqual(s.phone, '2100')
        self.assertEqual(s.address, 'Athens')
        self.assertEqual(s.email, 's@s.com')
        self.assertEqual(s.map_url, 'https://maps.google.com')


class StadiumDefaultsTest(TestCase):
    def test_optional_fields_default(self):
        s = Stadium.objects.create(name='Olympic', phone='2100', address='Athens')
        self.assertEqual(s.email, '')
        self.assertEqual(s.map_url, '')
        self.assertIsNone(s.cost)
        self.assertIsNone(s.comments)
