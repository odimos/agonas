from datetime import datetime
from decimal import Decimal
from urllib.parse import urlparse

from ninja import Schema
from pydantic import field_validator, model_validator
from typing import Optional


class HelloResponse(Schema):
    message: str


class RefereeIn(Schema):
    first_name: str
    last_name: str
    phone: str
    email: str = ''
    comments: Optional[str] = None

    @field_validator('first_name', 'last_name', 'phone')
    @classmethod
    def required_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('This field is required and cannot be blank.')
        return v

    @field_validator('email', mode='before')
    @classmethod
    def trim_email(cls, v):
        return v.strip() if isinstance(v, str) else v

    @field_validator('comments', mode='before')
    @classmethod
    def trim_comments(cls, v):
        if isinstance(v, str):
            return v.strip() or None
        return v


class RefereeOut(Schema):
    id: int
    first_name: str
    last_name: str
    phone: str
    email: str
    comments: Optional[str]


class StadiumIn(Schema):
    name: str
    phone: str
    address: str
    email: str = ''
    cost: Optional[Decimal] = None
    comments: Optional[str] = None
    map_url: str = ''

    @field_validator('name', 'phone', 'address')
    @classmethod
    def required_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('This field is required and cannot be blank.')
        return v

    @field_validator('email', 'map_url', mode='before')
    @classmethod
    def trim_string(cls, v):
        return v.strip() if isinstance(v, str) else v

    @field_validator('comments', mode='before')
    @classmethod
    def trim_comments(cls, v):
        if isinstance(v, str):
            return v.strip() or None
        return v

    @field_validator('cost')
    @classmethod
    def cost_non_negative(cls, v):
        if v is not None and v < 0:
            raise ValueError('Cost must be 0 or greater.')
        return v

    @field_validator('map_url')
    @classmethod
    def validate_url(cls, v):
        if v:
            result = urlparse(v)
            if not all([result.scheme, result.netloc]):
                raise ValueError('Enter a valid URL (e.g. https://maps.google.com/...).')
        return v


class StadiumOut(Schema):
    id: int
    name: str
    phone: str
    address: str
    email: str
    cost: Optional[Decimal]
    comments: Optional[str]
    map_url: str


class PlayerIn(Schema):
    first_name: str
    last_name: str
    nickname: str = ''
    phone: str = ''
    email: str = ''
    comments: Optional[str] = None
    team_id: Optional[int] = None

    @field_validator('first_name', 'last_name')
    @classmethod
    def required_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('This field is required and cannot be blank.')
        return v

    @field_validator('nickname', 'phone', 'email', mode='before')
    @classmethod
    def trim_optional(cls, v):
        return v.strip() if isinstance(v, str) else v

    @field_validator('comments', mode='before')
    @classmethod
    def trim_comments(cls, v):
        if isinstance(v, str):
            return v.strip() or None
        return v


class PlayerOut(Schema):
    id: int
    first_name: str
    last_name: str
    nickname: str
    phone: str
    email: str
    comments: Optional[str]
    team_id: Optional[int]


class TeamIn(Schema):
    name: str
    is_active: bool = True
    comments: Optional[str] = None
    captain_id: Optional[int] = None
    vice_captain_id: Optional[int] = None

    @field_validator('name')
    @classmethod
    def required_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('This field is required and cannot be blank.')
        return v

    @field_validator('comments', mode='before')
    @classmethod
    def trim_comments(cls, v):
        if isinstance(v, str):
            return v.strip() or None
        return v


class TeamOut(Schema):
    id: int
    name: str
    is_active: bool
    comments: Optional[str]
    captain_id: Optional[int]
    vice_captain_id: Optional[int]


VALID_STATUSES = ['draft', 'canceled', 'finished', 'expected']


class MatchIn(Schema):
    status: str
    home_team_id: Optional[int] = None
    away_team_id: Optional[int] = None
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    home_fair_play: Optional[int] = None
    away_fair_play: Optional[int] = None
    referee_id: Optional[int] = None
    stadium_id: Optional[int] = None
    scheduled_at: Optional[datetime] = None
    comments: Optional[str] = None
    tournament_id: Optional[int] = None

    @field_validator('status')
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in VALID_STATUSES:
            raise ValueError(f'Status must be one of: {", ".join(VALID_STATUSES)}')
        return v

    @field_validator('comments', mode='before')
    @classmethod
    def trim_comments(cls, v):
        if isinstance(v, str):
            return v.strip() or None
        return v

    @model_validator(mode='after')
    def validate_by_status(self):
        s = self.status
        if s == 'expected':
            for f in ['home_team_id', 'away_team_id', 'referee_id', 'stadium_id', 'scheduled_at']:
                if getattr(self, f) is None:
                    raise ValueError(f'{f} is required when status is expected')
            if self.home_team_id == self.away_team_id:
                raise ValueError('home_team_id and away_team_id must be different')
            for f in ['home_score', 'away_score', 'home_fair_play', 'away_fair_play']:
                if getattr(self, f) is not None:
                    raise ValueError(f'{f} must be empty when status is expected')
        elif s == 'finished':
            for f in ['home_team_id', 'away_team_id', 'referee_id', 'stadium_id', 'scheduled_at',
                      'home_score', 'away_score', 'home_fair_play', 'away_fair_play']:
                if getattr(self, f) is None:
                    raise ValueError(f'{f} is required when status is finished')
            if self.home_team_id == self.away_team_id:
                raise ValueError('home_team_id and away_team_id must be different')
            if self.home_score < 0 or self.away_score < 0:
                raise ValueError('Scores must be >= 0')
            if not (-5 <= self.home_fair_play <= 5) or not (-5 <= self.away_fair_play <= 5):
                raise ValueError('Fair play must be between -5 and 5')
        else:
            if (self.home_team_id is not None and self.away_team_id is not None
                    and self.home_team_id == self.away_team_id):
                raise ValueError('home_team_id and away_team_id must be different')
        return self


class MatchOut(Schema):
    id: int
    status: str
    home_team_id: Optional[int]
    away_team_id: Optional[int]
    home_score: Optional[int]
    away_score: Optional[int]
    home_fair_play: Optional[int]
    away_fair_play: Optional[int]
    referee_id: Optional[int]
    stadium_id: Optional[int]
    scheduled_at: Optional[datetime]
    comments: Optional[str]
    tournament_id: Optional[int]