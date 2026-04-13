from django.test import TestCase

from api.models import Team


class TeamModelTest(TestCase):
    def test_str(self):
        t = Team(name='Alpha')
        self.assertEqual(str(t), 'Alpha')

    def test_trim_on_save(self):
        t = Team.objects.create(name='  Beta  ')
        self.assertEqual(t.name, 'Beta')

    def test_default_is_active(self):
        t = Team.objects.create(name='Gamma')
        self.assertTrue(t.is_active)

    def test_comments_trimmed(self):
        t = Team.objects.create(name='Delta', comments='  note  ')
        self.assertEqual(t.comments, 'note')

    def test_comments_default_none(self):
        t = Team.objects.create(name='Epsilon')
        self.assertIsNone(t.comments)
