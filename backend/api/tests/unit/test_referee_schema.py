"""
Unit tests for RefereeIn schema validation.

Pure logic — no database, no HTTP.
"""
from django.test import SimpleTestCase
from pydantic import ValidationError

from api.schema import RefereeIn


class RefereeInValidationTest(SimpleTestCase):
    def test_valid_minimal(self):
        r = RefereeIn(first_name='John', last_name='Smith', phone='6999')
        self.assertEqual(r.first_name, 'John')

    def test_trims_required_fields(self):
        r = RefereeIn(first_name='  John  ', last_name='  Smith  ', phone='  6999  ')
        self.assertEqual(r.first_name, 'John')
        self.assertEqual(r.last_name, 'Smith')
        self.assertEqual(r.phone, '6999')

    def test_trims_optional_email(self):
        r = RefereeIn(first_name='J', last_name='S', phone='1', email='  j@m.com  ')
        self.assertEqual(r.email, 'j@m.com')

    def test_blank_comments_becomes_none(self):
        r = RefereeIn(first_name='J', last_name='S', phone='1', comments='   ')
        self.assertIsNone(r.comments)

    def test_missing_first_name_raises(self):
        with self.assertRaises(ValidationError):
            RefereeIn(last_name='Smith', phone='6999')

    def test_blank_first_name_raises(self):
        with self.assertRaises(ValidationError):
            RefereeIn(first_name='   ', last_name='Smith', phone='6999')

    def test_blank_phone_raises(self):
        with self.assertRaises(ValidationError):
            RefereeIn(first_name='John', last_name='Smith', phone='   ')

    def test_email_optional(self):
        r = RefereeIn(first_name='J', last_name='S', phone='1')
        self.assertEqual(r.email, '')

    def test_comments_optional(self):
        r = RefereeIn(first_name='J', last_name='S', phone='1')
        self.assertIsNone(r.comments)
