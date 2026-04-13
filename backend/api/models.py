from django.db import models


class Team(models.Model):
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    comments = models.TextField(blank=True, null=True)
    captain = models.ForeignKey(
        'Player', null=True, blank=True, on_delete=models.SET_NULL,
        related_name='captain_of',
    )
    vice_captain = models.ForeignKey(
        'Player', null=True, blank=True, on_delete=models.SET_NULL,
        related_name='vice_captain_of',
    )

    def save(self, *args, **kwargs):
        self.name = self.name.strip()
        if self.comments:
            self.comments = self.comments.strip()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Stadium(models.Model):
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=30)
    email = models.EmailField(blank=True, default='')
    cost = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    comments = models.TextField(blank=True, null=True)
    address = models.CharField(max_length=200)
    map_url = models.URLField(blank=True, default='')

    def save(self, *args, **kwargs):
        self.name = self.name.strip()
        self.phone = self.phone.strip()
        self.email = self.email.strip()
        self.address = self.address.strip()
        self.map_url = self.map_url.strip()
        if self.comments:
            self.comments = self.comments.strip()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Referee(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, default='')
    comments = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        self.first_name = self.first_name.strip()
        self.last_name = self.last_name.strip()
        self.phone = self.phone.strip()
        self.email = self.email.strip()
        if self.comments:
            self.comments = self.comments.strip()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Player(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    nickname = models.CharField(max_length=100, blank=True, default='')
    phone = models.CharField(max_length=30, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    comments = models.TextField(blank=True, null=True)
    team = models.ForeignKey(Team, null=True, blank=True, on_delete=models.SET_NULL)

    def save(self, *args, **kwargs):
        self.first_name = self.first_name.strip()
        self.last_name = self.last_name.strip()
        self.nickname = self.nickname.strip()
        self.phone = self.phone.strip()
        self.email = self.email.strip()
        if self.comments:
            self.comments = self.comments.strip()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Tournament(models.Model):
    name = models.CharField(max_length=150)

    def save(self, *args, **kwargs):
        self.name = self.name.strip()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Match(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('canceled', 'Canceled'),
        ('finished', 'Finished'),
        ('expected', 'Expected'),
    ]

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    home_team = models.ForeignKey(
        Team, null=True, blank=True, on_delete=models.SET_NULL, related_name='home_matches',
    )
    away_team = models.ForeignKey(
        Team, null=True, blank=True, on_delete=models.SET_NULL, related_name='away_matches',
    )
    home_score = models.IntegerField(null=True, blank=True)
    away_score = models.IntegerField(null=True, blank=True)
    home_fair_play = models.IntegerField(null=True, blank=True)
    away_fair_play = models.IntegerField(null=True, blank=True)
    referee = models.ForeignKey(
        Referee, null=True, blank=True, on_delete=models.SET_NULL,
    )
    stadium = models.ForeignKey(
        Stadium, null=True, blank=True, on_delete=models.SET_NULL,
    )
    scheduled_at = models.DateTimeField(null=True, blank=True)
    comments = models.TextField(blank=True, null=True)
    tournament = models.ForeignKey(
        Tournament, null=True, blank=True, on_delete=models.SET_NULL,
    )

    def save(self, *args, **kwargs):
        if self.comments:
            self.comments = self.comments.strip()
        super().save(*args, **kwargs)

    def __str__(self):
        home = str(self.home_team) if self.home_team else '?'
        away = str(self.away_team) if self.away_team else '?'
        return f"{home} vs {away}"
