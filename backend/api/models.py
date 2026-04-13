from django.db import models


class Team(models.Model):
    name = models.CharField(max_length=100)

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
