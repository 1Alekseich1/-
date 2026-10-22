import re
from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

class Register(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=100)
    password: str = Field(min_length=8, max_length=72)

    @field_validator('password')
    @classmethod
    def check_password(cls, value: str) -> str:
        if not re.search(r'[A-Za-zА-Яа-я]', value) or not re.search(r'\d', value):
            raise ValueError('Пароль должен содержать буквы и цифры')
        return value

class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr
    full_name: str
    role: Literal['member', 'librarian']

class Tokens(BaseModel):
    access_token: str
    refresh_token: str
    token_type: Literal['bearer'] = 'bearer'

class Refresh(BaseModel):
    refresh_token: str
