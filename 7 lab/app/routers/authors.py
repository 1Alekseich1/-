from typing import Annotated
from fastapi import APIRouter, HTTPException, Query, Response
from app.core.dependencies import PaginationDep, RepositoryDep
from app.schemas.authors import AuthorCreate, AuthorRead, AuthorUpdate
from app.schemas.books import BookRead
from app.schemas.common import Page

router = APIRouter(prefix='/authors', tags=['Авторы'])


@router.get('', response_model=Page[AuthorRead], status_code=200)
def list_authors(repository: RepositoryDep, pagination: PaginationDep,
                 q: Annotated[str | None, Query(max_length=100)] = None) -> Page[AuthorRead]:
    authors = list(repository.authors.values())
    if q:
        authors = [a for a in authors if q.casefold().strip() in a['name'].casefold()]
    authors = sorted(authors, key=lambda a: (a['name'].casefold(), a['id']))
    total = len(authors)
    offset = (pagination.page - 1) * pagination.size
    return Page[AuthorRead](items=[AuthorRead.model_validate(a) for a in authors[offset:offset + pagination.size]],
                            total=total, page=pagination.page, size=pagination.size)


@router.get('/{author_id}', response_model=AuthorRead, status_code=200, responses={404: {'description': 'Автор не найден'}})
def get_author(author_id: int, repository: RepositoryDep) -> AuthorRead:
    author = repository.authors.get(author_id)
    if author is None:
        raise HTTPException(404, detail='Автор не найден')
    return AuthorRead.model_validate(author)


@router.get('/{author_id}/books', response_model=list[BookRead], status_code=200,
            responses={404: {'description': 'Автор не найден'}})
def author_books(author_id: int, repository: RepositoryDep) -> list[BookRead]:
    if author_id not in repository.authors:
        raise HTTPException(404, detail='Автор не найден')
    return [BookRead.model_validate(repository.read_book(book_id)) for book_id, book in repository.books.items()
            if book['author_id'] == author_id]


@router.post('', response_model=AuthorRead, status_code=201)
def create_author(data: AuthorCreate, repository: RepositoryDep) -> AuthorRead:
    return AuthorRead.model_validate(repository.create_author(data.model_dump()))


@router.patch('/{author_id}', response_model=AuthorRead, status_code=200, responses={404: {'description': 'Автор не найден'}})
def update_author(author_id: int, data: AuthorUpdate, repository: RepositoryDep) -> AuthorRead:
    author = repository.authors.get(author_id)
    if author is None:
        raise HTTPException(404, detail='Автор не найден')
    updates = data.model_dump(exclude_unset=True)
    if any(value is None for value in updates.values()):
        raise HTTPException(422, detail='Нельзя установить null вместо значения')
    updated = AuthorCreate.model_validate({**author, **updates})
    repository.authors[author_id] = {'id': author_id, **updated.model_dump()}
    return AuthorRead.model_validate(repository.authors[author_id])


@router.delete('/{author_id}', response_class=Response, status_code=204,
               responses={404: {'description': 'Автор не найден'}, 409: {'description': 'У автора есть книги'}})
def delete_author(author_id: int, repository: RepositoryDep) -> Response:
    if author_id not in repository.authors:
        raise HTTPException(404, detail='Автор не найден')
    if any(b['author_id'] == author_id for b in repository.books.values()):
        raise HTTPException(409, detail='Сначала удалите книги автора')
    del repository.authors[author_id]
    return Response(status_code=204)
