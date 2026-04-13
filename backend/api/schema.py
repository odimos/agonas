from decimal import Decimal
from urllib.parse import urlparse

from ninja import Schema
from pydantic import field_validator
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