from django.test import TestCase

from api.models import Player


class PlayerStrTest(TestCase):
    def test_str_returns_full_name(self):
        p = Player(first_name='John', last_name='Doe', phone='')
        self.assertEqual(str(p), 'John Doe')


class PlayerTrimTest(TestCase):
    def test_trims_all_fields_on_save(self):
        p = Player.objects.create(
            first_name='  John  ', last_name='  Doe  ',
            nickname='  jd  ', phone='  6999  ', email='  j@d.com  '
        )
        self.assertEqual(p.first_name, 'John')
        self.assertEqual(p.last_name, 'Doe')
        self.assertEqual(p.nickname, 'jd')
        self.assertEqual(p.phone, '6999')
        self.assertEqual(p.email, 'j@d.com')


class PlayerDefaultsTest(TestCase):
    def test_optional_fields_default(self):
        p = Player.objects.create(first_name='John', last_name='Doe')
        self.assertEqual(p.nickname, '')
        self.assertEqual(p.phone, '')
        self.assertEqual(p.email, '')
        self.assertIsNone(p.comments)
        self.assertIsNone(p.team)
