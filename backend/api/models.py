from django.db import models


class Team(models.Model):
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    comments = models.TextField(blank=True, null=True)
    photo = models.ImageField(upload_to='teams/', null=True, blank=True)
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
    created_at = models.DateTimeField(auto_now_add=True)

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


class StadiumAvailability(models.Model):
    DAY_CHOICES = [
        (0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'), (3, 'Thursday'),
        (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday'),
    ]
    stadium    = models.ForeignKey(Stadium, on_delete=models.CASCADE, related_name='availabilities')
    day        = models.PositiveSmallIntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    quantity   = models.PositiveSmallIntegerField(default=1)

    class Meta:
        ordering = ['day', 'start_time']

    def __str__(self):
        return f"{self.stadium.name} — Day {self.day} {self.start_time}"


class TeamPreference(models.Model):
    team         = models.ForeignKey('Team', on_delete=models.CASCADE, related_name='preferences')
    availability = models.ForeignKey(StadiumAvailability, on_delete=models.CASCADE, related_name='preferences')
    score        = models.PositiveSmallIntegerField(default=0)  # 0-3

    class Meta:
        unique_together = [('team', 'availability')]

    def __str__(self):
        return f"{self.team} — {self.availability} — {self.score}"


class RefereePreference(models.Model):
    referee      = models.ForeignKey('Referee', on_delete=models.CASCADE, related_name='preferences')
    availability = models.ForeignKey(StadiumAvailability, on_delete=models.CASCADE, related_name='referee_preferences')
    score        = models.PositiveSmallIntegerField(default=0)  # 0-3

    class Meta:
        unique_together = [('referee', 'availability')]

    def __str__(self):
        return f"{self.referee} — {self.availability} — {self.score}"


class Referee(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, default='')
    comments = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

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
    created_at = models.DateTimeField(auto_now_add=True)

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
    TYPE_CHOICES = [('knockout', 'Knockout'), ('league', 'League')]
    VISIBILITY_CHOICES = [('public', 'Public'), ('private', 'Private')]

    name       = models.CharField(max_length=150)
    started    = models.DateField(null=True, blank=True)
    type       = models.CharField(max_length=20, choices=TYPE_CHOICES, default='league')
    active     = models.BooleanField(default=True)
    visibility = models.CharField(max_length=10, choices=VISIBILITY_CHOICES, default='public')

    def save(self, *args, **kwargs):
        self.name = self.name.strip()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Phase(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='phases')
    order      = models.PositiveSmallIntegerField(default=1)
    is_open    = models.BooleanField(default=False)
    teams      = models.ManyToManyField('Team', blank=True, related_name='phases')

    class Meta:
        ordering = ['tournament', 'order']
        unique_together = [('tournament', 'order')]

    def __str__(self):
        return f"{self.tournament.name} — Phase {self.order}"


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
        Tournament, null=True, blank=True, on_delete=models.CASCADE,
    )
    phase = models.ForeignKey(
        'Phase', null=True, blank=True, on_delete=models.SET_NULL,
    )
    penalty_winner = models.ForeignKey(
        Team, null=True, blank=True, on_delete=models.SET_NULL, related_name='penalty_wins',
    )

    def save(self, *args, **kwargs):
        if self.comments:
            self.comments = self.comments.strip()
        super().save(*args, **kwargs)

    def __str__(self):
        home = str(self.home_team) if self.home_team else '?'
        away = str(self.away_team) if self.away_team else '?'
        return f"{home} vs {away}"


class MatchPlayerCard(models.Model):
    CARD_TYPES = [('yellow', 'Yellow'), ('red', 'Red')]

    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='cards')
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='cards')
    team = models.ForeignKey(Team, null=True, blank=True, on_delete=models.SET_NULL, related_name='match_player_cards')
    card_type = models.CharField(max_length=10, choices=CARD_TYPES)
    minute = models.IntegerField()
    comments = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.comments:
            self.comments = self.comments.strip()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.card_type} card – {self.player} ({self.match})"


class MatchPlayerGoal(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='goals')
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='goals')
    team = models.ForeignKey(Team, null=True, blank=True, on_delete=models.SET_NULL, related_name='match_player_goals')
    own_goal = models.BooleanField(default=False)
    minute = models.IntegerField()

    def __str__(self):
        og = ' (OG)' if self.own_goal else ''
        return f"Goal{og} – {self.player} ({self.match})"
