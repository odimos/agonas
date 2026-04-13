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