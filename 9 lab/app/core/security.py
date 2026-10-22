from datetime import datetime, timedelta, timezone
from typing import Literal
import jwt
from fastapi import HTTPException, status
from passlib.context import CryptContext
from app.config import settings

password_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
TokenType = Literal['access', 'refresh']

def hash_password(password: str) -> str:
    return password_context.hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    return password_context.verify(password, password_hash)

def create_token(user_id: int, role: str, kind: TokenType) -> str:
    now = datetime.now(timezone.utc)
    minutes = 20 if kind == 'access' else 60 * 24 * 7
    return jwt.encode({'sub': str(user_id), 'role': role, 'iat': now,
                       'exp': now + timedelta(minutes=minutes), 'type': kind},
                      settings.secret_key, algorithm='HS256')

def parse_token(token: str, kind: TokenType) -> dict[str, object]:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=['HS256'], options={'require': ['sub','role','iat','exp','type']})
        if payload['type'] != kind or payload['role'] not in ('member','librarian'):
            raise ValueError('Invalid token type or role')
        return payload
    except (jwt.PyJWTError, ValueError, KeyError) as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, 'Недействительные учётные данные', headers={'WWW-Authenticate':'Bearer'}) from exc
