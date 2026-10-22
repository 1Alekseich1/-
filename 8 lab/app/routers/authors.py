from typing import Annotated
from fastapi import APIRouter, Query, Response
from app.core.dependencies import DbDep, PaginationDep
from app.schemas.authors import AuthorCreate, AuthorRead, AuthorUpdate
from app.schemas.books import BookRead
from app.schemas.common import Page
from app.services.catalog import CatalogService

router = APIRouter(prefix='/authors', tags=['Авторы'])

@router.get('', response_model=Page[AuthorRead], status_code=200)
def list_authors(db: DbDep, pagination: PaginationDep, q: Annotated[str | None, Query(max_length=100)] = None) -> Page[AuthorRead]:
    rows, total = CatalogService(db).repo.authors(q, pagination.page, pagination.size)
    return Page[AuthorRead](items=[AuthorRead.model_validate(a) for a in rows], total=total,
                            page=pagination.page, size=pagination.size)

@router.get('/{author_id}', response_model=AuthorRead, status_code=200, responses={404: {'description': 'Не найдено'}})
def get_author(author_id: int, db: DbDep) -> AuthorRead:
    return AuthorRead.model_validate(CatalogService(db).author(author_id))

@router.get('/{author_id}/books', response_model=list[BookRead], status_code=200, responses={404: {'description': 'Не найдено'}})
def author_books(author_id: int, db: DbDep) -> list[BookRead]:
    service = CatalogService(db)
    service.author(author_id)
    return [service.read(b) for b in service.repo.author_books(author_id)]

@router.post('', response_model=AuthorRead, status_code=201)
def create_author(data: AuthorCreate, db: DbDep) -> AuthorRead:
    return AuthorRead.model_validate(CatalogService(db).create_author(data))

@router.patch('/{author_id}', response_model=AuthorRead, status_code=200, responses={404: {'description': 'Не найдено'}})
def patch_author(author_id: int, data: AuthorUpdate, db: DbDep) -> AuthorRead:
    return AuthorRead.model_validate(CatalogService(db).update_author(author_id, data))

@router.delete('/{author_id}', response_class=Response, status_code=204, responses={404: {'description': 'Не найдено'}, 409: {'description': 'Есть книги'}})
def delete_author(author_id: int, db: DbDep) -> Response:
    CatalogService(db).delete_author(author_id)
    return Response(status_code=204)
