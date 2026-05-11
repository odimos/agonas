from datetime import date, datetime, time
from decimal import Decimal
from urllib.parse import urlparse
from typing import List

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
    created_at: datetime


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
    created_at: datetime


class StadiumAvailabilityIn(Schema):
    day: int
    start_time: time
    quantity: int = 1

    @field_validator('day')
    @classmethod
    def validate_day(cls, v):
        if v not in range(7):
            raise ValueError('day must be 0–6')
        return v

    @field_validator('quantity')
    @classmethod
    def validate_quantity(cls, v):
        if v < 1:
            raise ValueError('quantity must be >= 1')
        return v


class StadiumAvailabilityOut(Schema):
    id: int
    stadium_id: int
    stadium_name: str
    day: int
    start_time: time
    quantity: int

    @staticmethod
    def resolve_stadium_name(obj):
        return obj.stadium.name


class TeamPreferenceOut(Schema):
    id: int
    team_id: int
    availability_id: int
    score: int


class TeamPreferenceIn(Schema):
    availability_id: int
    score: int

    @field_validator('score')
    @classmethod
    def validate_score(cls, v):
        if v not in (0, 1, 2, 3):
            raise ValueError('score must be 0, 1, 2 or 3')
        return v


class RefereePreferenceOut(Schema):
    id: int
    referee_id: int
    availability_id: int
    score: int


class RefereePreferenceIn(Schema):
    availability_id: int
    score: int

    @field_validator('score')
    @classmethod
    def validate_score(cls, v):
        if v not in (0, 1, 2, 3):
            raise ValueError('score must be 0, 1, 2 or 3')
        return v


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
    created_at: datetime


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
    created_at: datetime


class TournamentIn(Schema):
    name: str
    started: Optional[date] = None
    type: str = 'league'
    active: bool = True
    visibility: str = 'public'

    @field_validator('name')
    @classmethod
    def required_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('This field is required and cannot be blank.')
        return v

    @field_validator('type')
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in ('knockout', 'league'):
            raise ValueError('type must be knockout or league')
        return v

    @field_validator('visibility')
    @classmethod
    def validate_visibility(cls, v: str) -> str:
        if v not in ('public', 'private'):
            raise ValueError('visibility must be public or private')
        return v


class TournamentOut(Schema):
    id: int
    name: str
    started: Optional[date]
    type: str
    active: bool
    visibility: str


class PhaseIn(Schema):
    order: int = 1
    is_open: bool = False
    team_ids: List[int] = []


class PhaseOut(Schema):
    id: int
    tournament_id: int
    order: int
    is_open: bool
    team_ids: List[int]

    @staticmethod
    def resolve_team_ids(obj):
        return list(obj.teams.values_list('id', flat=True))


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
    phase_id: Optional[int] = None

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
        is_bye = self.tournament_id is not None and (
            self.home_team_id is None or self.away_team_id is None
        ) and (self.home_team_id is not None or self.away_team_id is not None)

        # draft and canceled: no rules except same-team
        if s in ('draft', 'canceled'):
            if (self.home_team_id is not None and self.away_team_id is not None
                    and self.home_team_id == self.away_team_id):
                raise ValueError('home_team_id and away_team_id must be different')
            return self

        # expected and finished require tournament to have a phase
        if self.tournament_id is not None and self.phase_id is None:
            raise ValueError('Ένας αγώνας τουρνουά πρέπει να ανήκει σε φάση.')

        if s == 'expected':
            if is_bye:
                if self.home_team_id is None and self.away_team_id is None:
                    raise ValueError('At least one team is required for a bye match')
            else:
                for f in ['home_team_id', 'away_team_id']:
                    if getattr(self, f) is None:
                        raise ValueError(f'{f} is required when status is expected')
            for f in ['referee_id', 'stadium_id', 'scheduled_at']:
                if getattr(self, f) is None:
                    raise ValueError(f'{f} is required when status is expected')
            if self.home_team_id and self.away_team_id and self.home_team_id == self.away_team_id:
                raise ValueError('home_team_id and away_team_id must be different')
            for f in ['home_score', 'away_score', 'home_fair_play', 'away_fair_play']:
                if getattr(self, f) is not None:
                    raise ValueError(f'{f} must be empty when status is expected')
        elif s == 'finished':
            if is_bye:
                pass
            else:
                for f in ['home_team_id', 'away_team_id']:
                    if getattr(self, f) is None:
                        raise ValueError(f'{f} is required when status is finished')
                for f in ['referee_id', 'stadium_id', 'scheduled_at', 'home_score', 'away_score', 'home_fair_play', 'away_fair_play']:
                    if getattr(self, f) is None:
                        raise ValueError(f'{f} is required when status is finished')
                if self.home_team_id == self.away_team_id:
                    raise ValueError('home_team_id and away_team_id must be different')
                if self.home_score < 0 or self.away_score < 0:
                    raise ValueError('Scores must be >= 0')
                if not (-5 <= self.home_fair_play <= 5) or not (-5 <= self.away_fair_play <= 5):
                    raise ValueError('Fair play must be between -5 and 5')
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
    phase_id: Optional[int]


class MatchPlayerCardIn(Schema):
    player_id: int
    match_id: int
    team_id: int
    card_type: str
    minute: int
    comments: Optional[str] = None

    @field_validator('card_type')
    @classmethod
    def validate_card_type(cls, v: str) -> str:
        if v not in ('yellow', 'red'):
            raise ValueError('card_type must be yellow or red')
        return v

    @field_validator('minute')
    @classmethod
    def validate_minute(cls, v: int) -> int:
        if not (0 <= v <= 130):
            raise ValueError('minute must be between 0 and 130')
        return v

    @field_validator('comments', mode='before')
    @classmethod
    def trim_comments(cls, v):
        if isinstance(v, str):
            return v.strip() or None
        return v


class MatchPlayerCardOut(Schema):
    id: int
    player_id: int
    match_id: int
    team_id: Optional[int]
    card_type: str
    minute: int
    comments: Optional[str]


class MatchPlayerGoalIn(Schema):
    player_id: int
    match_id: int
    team_id: int
    own_goal: bool = False
    minute: int

    @field_validator('minute')
    @classmethod
    def validate_minute(cls, v: int) -> int:
        if not (0 <= v <= 130):
            raise ValueError('minute must be between 0 and 130')
        return v


class MatchPlayerGoalOut(Schema):
    id: int
    player_id: int
    match_id: int
    team_id: Optional[int]
    own_goal: bool
    minute: int