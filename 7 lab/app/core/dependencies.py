from typing import Annotated
from fastapi import Depends, Query, Request
from app.repositories.memory import MemoryRepository
from app.schemas.common import Pagination

def get_repository(request: Request) -> MemoryRepository:
    return request.app.state.repository

def get_pagination(
    page: Annotated[int, Query(ge=1, description='Номер страницы')] = 1,
    size: Annotated[int, Query(ge=1, le=100, description='Размер страницы')] = 20,
) -> Pagination:
    return Pagination(page=page, size=size)

RepositoryDep = Annotated[MemoryRepository, Depends(get_repository)]
PaginationDep = Annotated[Pagination, Depends(get_pagination)]
