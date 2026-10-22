from typing import Annotated
from fastapi import APIRouter, HTTPException, Query, Response, status
from pydantic import ValidationError
from app.core.dependencies import PaginationDep, RepositoryDep
from app.schemas.books import BookCreate, BookRead, BookUpdate, Genre, Sort
from app.schemas.common import Page

router = APIRouter(prefix='/books', tags=['Книги'])


def ensure_author(repository: RepositoryDep, author_id: int) -> None:
    if author_id not in repository.authors:
        raise HTTPException(422, detail='Указанный автор не найден')


def ensure_unique_isbn(repository: RepositoryDep, isbn: str, exclude: int | None = None) -> None:
    if any(b['isbn'] == isbn and b['id'] != exclude for b in repository.books.values()):
        raise HTTPException(409, detail='Книга с таким ISBN уже существует')


@router.get('', response_model=Page[BookRead], status_code=200, summary='Каталог книг')
def list_books(repository: RepositoryDep, pagination: PaginationDep,
               q: Annotated[str | None, Query(max_length=150)] = None,
               genre: Genre | None = None, available_only: bool = False,
               sort: Sort = 'title') -> Page[BookRead]:
    rows = [repository.read_book(book_id) for book_id in repository.books]
    books = [book for book in rows if book is not None]
    if q:
        term = q.casefold().strip()
        books = [b for b in books if term in b['title'].casefold() or
                 term in repository.authors[b['author_id']]['name'].casefold()]
    if genre is not None:
        books = [b for b in books if b['genre'] == genre]
    if available_only:
        books = [b for b in books if b['available']]
    descending = sort.startswith('-')
    field = sort.lstrip('-')
    books = sorted(books, key=lambda b: (b[field].casefold() if isinstance(b[field], str) else b[field], b['id']), reverse=descending)
    total = len(books)
    offset = (pagination.page - 1) * pagination.size
    return Page[BookRead](items=[BookRead.model_validate(book) for book in books[offset:offset + pagination.size]],
                          total=total, page=pagination.page, size=pagination.size)


@router.get('/{book_id}', response_model=BookRead, status_code=200, responses={404: {'description': 'Книга не найдена'}})
def get_book(book_id: int, repository: RepositoryDep) -> BookRead:
    book = repository.read_book(book_id)
    if book is None:
        raise HTTPException(404, detail='Книга не найдена')
    return BookRead.model_validate(book)


@router.post('', response_model=BookRead, status_code=201,
             responses={409: {'description': 'ISBN уже существует'}, 422: {'description': 'Ошибочные поля или автор'}})
def create_book(data: BookCreate, repository: RepositoryDep) -> BookRead:
    ensure_author(repository, data.author_id)
    ensure_unique_isbn(repository, data.isbn)
    book = repository.create_book(data.model_dump())
    return BookRead.model_validate(repository.read_book(book['id']))


@router.patch('/{book_id}', response_model=BookRead, status_code=200,
              responses={404: {'description': 'Книга не найдена'}, 409: {'description': 'ISBN уже существует'}})
def update_book(book_id: int, data: BookUpdate, repository: RepositoryDep) -> BookRead:
    existing = repository.books.get(book_id)
    if existing is None:
        raise HTTPException(404, detail='Книга не найдена')
    changes = data.model_dump(exclude_unset=True)
    if any(value is None for value in changes.values()):
        raise HTTPException(422, detail='Нельзя установить null вместо значения')
    merged = {**existing, **changes}
    try:
        checked = BookCreate.model_validate({key: value for key, value in merged.items() if key != 'id'})
    except ValidationError as error:
        raise HTTPException(422, detail=error.errors(include_context=False)) from error
    ensure_author(repository, checked.author_id)
    ensure_unique_isbn(repository, checked.isbn, exclude=book_id)
    repository.books[book_id] = {'id': book_id, **checked.model_dump()}
    return BookRead.model_validate(repository.read_book(book_id))


@router.delete('/{book_id}', status_code=status.HTTP_204_NO_CONTENT, response_class=Response,
               responses={404: {'description': 'Книга не найдена'}})
def delete_book(book_id: int, repository: RepositoryDep) -> Response:
    if repository.books.pop(book_id, None) is None:
        raise HTTPException(404, detail='Книга не найдена')
    return Response(status_code=204)
