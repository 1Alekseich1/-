from typing import Annotated
from fastapi import APIRouter, HTTPException, Query, Response
from app.core.dependencies import DbDep, PaginationDep
from app.core.auth import Librarian
from app.schemas.books import BookCreate, BookRead, BookUpdate, Genre, Sort
from app.schemas.common import Page
from app.services.catalog import CatalogService

router = APIRouter(prefix='/books', tags=['Книги'])

@router.get('', response_model=Page[BookRead], status_code=200)
def list_books(db: DbDep, pagination: PaginationDep, q: Annotated[str | None, Query(max_length=150)] = None,
               genre: Genre | None = None, available_only: bool = False, sort: Sort = 'title') -> Page[BookRead]:
    service = CatalogService(db)
    rows, total = service.repo.books(q, genre, available_only, sort, pagination.page, pagination.size)
    return Page[BookRead](items=[service.read(b) for b in rows], total=total, page=pagination.page, size=pagination.size)

@router.get('/{book_id}', response_model=BookRead, status_code=200, responses={404: {'description': 'Не найдено'}})
def get_book(book_id: int, db: DbDep) -> BookRead:
    service = CatalogService(db)
    return service.read(service.book(book_id))

@router.post('', response_model=BookRead, status_code=201, responses={409: {'description': 'ISBN занят'}, 422: {'description': 'Ошибка валидации'}})
def create_book(data: BookCreate, db: DbDep, librarian: Librarian) -> BookRead:
    return CatalogService(db).create_book(data)

@router.patch('/{book_id}', response_model=BookRead, status_code=200, responses={404: {'description': 'Не найдено'}, 409: {'description': 'Конфликт'}})
def patch_book(book_id: int, data: BookUpdate, db: DbDep, librarian: Librarian) -> BookRead:
    return CatalogService(db).update_book(book_id, data)

@router.delete('/{book_id}', response_class=Response, status_code=204, responses={404: {'description': 'Не найдено'}, 409: {'description': 'Есть выдачи'}})
def delete_book(book_id: int, db: DbDep, librarian: Librarian) -> Response:
    CatalogService(db).delete_book(book_id)
    return Response(status_code=204)
