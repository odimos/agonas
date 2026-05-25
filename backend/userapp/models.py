from django.db import models
from api.models import Player, Referee, Team


class AppUser(models.Model):
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)
    bio = models.TextField(blank=True, default='')
    photo = models.ImageField(upload_to='users/', null=True, blank=True)

    # roles — all optional
    player = models.ForeignKey(Player, null=True, blank=True, on_delete=models.SET_NULL, related_name='app_users')
    referee = models.ForeignKey(Referee, null=True, blank=True, on_delete=models.SET_NULL, related_name='app_users')
    # captain role: derived — user is captain if player is captain_of some team

    def is_player(self):
        return self.player_id is not None

    def is_referee(self):
        return self.referee_id is not None

    def is_captain(self):
        if not self.player_id:
            return False
        return Team.objects.filter(captain=self.player).exists()

    def __str__(self):
        return self.username
