"""
Unit tests for the Referee model.

These test model-level logic: field defaults, the save() trim behaviour,
and __str__. They use Django's test database but make no HTTP requests.
"""
from django.test import TestCase

from api.models import Referee


class RefereeStrTest(TestCase):
    def test_str_returns_full_name(self):
        r = Referee(first_name='John', last_name='Smith', phone='6999999999')
        self.assertEqual(str(r), 'John Smith')


class RefereeTrimTest(TestCase):
    def test_trims_all_fields_on_save(self):
        r = Referee.objects.create(
            first_name='  John  ', last_name='  Smith  ', phone='  6999  ',
            email='  j@m.com  ', comments='  note  '
        )
        self.assertEqual(r.first_name, 'John')
        self.assertEqual(r.last_name, 'Smith')
        self.assertEqual(r.phone, '6999')
        self.assertEqual(r.email, 'j@m.com')
        self.assertEqual(r.comments, 'note')

    def test_trim_applied_on_update(self):
        r = Referee.objects.create(first_name='Jane', last_name='Doe', phone='6900')
        r.first_name = '  Jane  '
        r.save()
        r.refresh_from_db()
        self.assertEqual(r.first_name, 'Jane')


class RefereeDefaultsTest(TestCase):
    def test_email_defaults_to_empty_string(self):
        r = Referee.objects.create(first_name='Jane', last_name='Doe', phone='6900')
        self.assertEqual(r.email, '')

    def test_comments_defaults_to_null(self):
        r = Referee.objects.create(first_name='Jane', last_name='Doe', phone='6900')
        self.assertIsNone(r.comments)

    def test_all_required_fields_stored(self):
        r = Referee.objects.create(
            first_name='John', last_name='Smith', phone='6999999999',
            email='john@mail.com', comments='Experienced'
        )
        self.assertEqual(r.first_name, 'John')
        self.assertEqual(r.email, 'john@mail.com')
        self.assertEqual(r.comments, 'Experienced')
