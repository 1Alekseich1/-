from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError
from app.core.dependencies import DbDep
from app.core.auth import CurrentUser
from app.core.security import create_token, hash_password, parse_token, verify_password
from app.models.entities import User
from app.repositories.users import UserRepository
from app.schemas.auth import Register, Refresh, Tokens, UserRead

router = APIRouter(prefix='/auth', tags=['Авторизация'])

@router.post('/register', status_code=201, response_model=UserRead, responses={409: {'description':'Email занят'}})
def register(data: Register, db: DbDep) -> UserRead:
    repo = UserRepository(db)
    if repo.by_email(str(data.email)) is not None:
        raise HTTPException(409, 'Этот email уже зарегистрирован')
    user = User(email=str(data.email), full_name=data.full_name, password_hash=hash_password(data.password), role='member', is_active=True)
    db.add(user)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(409, 'Этот email уже зарегистрирован') from exc
    db.refresh(user)
    return UserRead.model_validate(user)

@router.post('/token', status_code=200, response_model=Tokens, responses={401: {'description':'Неверные данные'}})
def login(form: Annotated[OAuth2PasswordRequestForm, Depends()], db: DbDep) -> Tokens:
    user = UserRepository(db).by_email(form.username)
    if user is None or not user.password_hash or not user.is_active or not verify_password(form.password, user.password_hash):
        raise HTTPException(401, 'Неверный логин или пароль', headers={'WWW-Authenticate':'Bearer'})
    return Tokens(access_token=create_token(user.id, user.role, 'access'), refresh_token=create_token(user.id, user.role, 'refresh'))

@router.post('/refresh', status_code=200, response_model=Tokens, responses={401: {'description':'Недействительный токен'}})
def refresh(data: Refresh, db: DbDep) -> Tokens:
    payload = parse_token(data.refresh_token, 'refresh')
    try:
        user_id = int(str(payload['sub']))
    except (ValueError, TypeError) as exc:
        raise HTTPException(401, 'Недействительный токен') from exc
    user = UserRepository(db).by_id(user_id)
    if user is None or not user.is_active or user.role != payload['role']:
        raise HTTPException(401, 'Недействительный токен')
    return Tokens(access_token=create_token(user.id, user.role, 'access'), refresh_token=create_token(user.id, user.role, 'refresh'))

@router.get('/me', status_code=200, response_model=UserRead)
def me(user: CurrentUser) -> UserRead:
    return UserRead.model_validate(user)
