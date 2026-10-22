from typing import Annotated, Callable
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import parse_token
from app.models.entities import User, Loan
from app.repositories.users import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/auth/token')

def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Annotated[Session, Depends(get_db)]) -> User:
    payload = parse_token(token, 'access')
    try:
        user_id = int(str(payload['sub']))
    except (ValueError, TypeError) as exc:
        raise HTTPException(401, 'Недействительные учётные данные') from exc
    user = UserRepository(db).by_id(user_id)
    if user is None or not user.is_active or user.role != payload['role']:
        raise HTTPException(401, 'Недействительные учётные данные')
    return user

CurrentUser = Annotated[User, Depends(get_current_user)]

def require_role(role: str) -> Callable[..., User]:
    def check(user: CurrentUser) -> User:
        if user.role != role:
            raise HTTPException(403, 'Недостаточно прав')
        return user
    return check

Librarian = Annotated[User, Depends(require_role('librarian'))]

def check_loan_owner(loan: Loan, user: User) -> None:
    if user.role != 'librarian' and loan.user_id != user.id:
        raise HTTPException(404, 'Выдача не найдена')
