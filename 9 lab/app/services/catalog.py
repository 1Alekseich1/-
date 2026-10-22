from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.models.entities import Author, Book, Genre
from app.repositories.catalog import CatalogRepository
from app.schemas.authors import AuthorCreate, AuthorUpdate
from app.schemas.books import BookCreate, BookUpdate, BookRead

class CatalogService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CatalogRepository(db)

    def read(self, book: Book) -> BookRead:
        genre = book.genres[0].name if book.genres else 'Классика'
        return BookRead.model_validate({**{k: getattr(book, k) for k in ('id', 'title', 'author_id', 'isbn', 'year', 'rating', 'copies_total', 'copies_available', 'description')}, 'genre': genre, 'available': book.copies_available > 0})

    def book(self, id: int) -> Book:
        value = self.repo.book(id)
        if value is None:
            raise HTTPException(404, 'Книга не найдена')
        return value

    def author(self, id: int) -> Author:
        value = self.repo.author(id)
        if value is None:
            raise HTTPException(404, 'Автор не найден')
        return value

    def _check_book(self, data: BookCreate, exclude: int | None = None) -> Genre:
        if self.repo.author(data.author_id) is None:
            raise HTTPException(422, 'Указанный автор не найден')
        if self.repo.isbn_exists(data.isbn, exclude):
            raise HTTPException(409, 'Книга с таким ISBN уже существует')
        genre = self.repo.genre(data.genre)
        if genre is None:
            raise HTTPException(422, 'Жанр не найден')
        return genre

    def create_book(self, data: BookCreate) -> BookRead:
        genre = self._check_book(data)
        values = data.model_dump(exclude={'genre'})
        book = Book(**values)
        book.genres = [genre]
        self.db.add(book)
        self.db.commit()
        return self.read(self.book(book.id))

    def update_book(self, id: int, data: BookUpdate) -> BookRead:
        book = self.book(id)
        changes = data.model_dump(exclude_unset=True)
        if any(value is None for value in changes.values()):
            raise HTTPException(422, 'Нельзя установить null вместо значения')
        old = self.read(book).model_dump(exclude={'id', 'available'})
        try:
            checked = BookCreate.model_validate({**old, **changes})
        except ValidationError as exc:
            raise HTTPException(422, exc.errors(include_context=False)) from exc
        genre = self._check_book(checked, id)
        for key, value in checked.model_dump(exclude={'genre'}).items():
            setattr(book, key, value)
        book.genres = [genre]
        self.db.commit()
        return self.read(self.book(id))

    def delete_book(self, id: int) -> None:
        book = self.book(id)
        if self.repo.book_has_loans(id):
            raise HTTPException(409, 'Нельзя удалить книгу с историей выдач')
        self.db.delete(book)
        self.db.commit()

    def create_author(self, data: AuthorCreate) -> Author:
        obj = Author(**data.model_dump())
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update_author(self, id: int, data: AuthorUpdate) -> Author:
        obj = self.author(id)
        changes = data.model_dump(exclude_unset=True)
        if any(value is None for value in changes.values()):
            raise HTTPException(422, 'Нельзя установить null вместо значения')
        try:
            checked = AuthorCreate.model_validate({**{k: getattr(obj, k) for k in ('name', 'country', 'birth_year')}, **changes})
        except ValidationError as exc:
            raise HTTPException(422, exc.errors(include_context=False)) from exc
        for key, value in checked.model_dump().items():
            setattr(obj, key, value)
        self.db.commit()
        return obj

    def delete_author(self, id: int) -> None:
        obj = self.author(id)
        if self.repo.author_has_books(id):
            raise HTTPException(409, 'Сначала удалите книги автора')
        self.db.delete(obj)
        self.db.commit()
