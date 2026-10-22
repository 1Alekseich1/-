from typing import Annotated
from fastapi import Depends
from pydantic import Field
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.common import Pagination

DbDep = Annotated[Session, Depends(get_db)]

def pagination(page: int = 1, size: int = 20) -> Pagination:
    return Pagination(page=page, size=size)

PaginationDep = Annotated[Pagination, Depends(pagination)]
