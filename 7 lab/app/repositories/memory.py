from typing import Any
from app.schemas.authors import AuthorCreate
from app.schemas.books import BookCreate

class MemoryRepository:
    def __init__(self) -> None:
        self.authors: dict[int, dict[str, Any]] = {}
        self.books: dict[int, dict[str, Any]] = {}
        self.next_author_id = 1
        self.next_book_id = 1
        self._seed()

    def _seed(self) -> None:
        authors = [
            ('Михаил Булгаков', 'Россия', 1891),
            ('Жюль Верн', 'Франция', 1828),
            ('Артур Конан Дойл', 'Великобритания', 1859),
        ]
        for name, country, birth_year in authors:
            self.create_author(AuthorCreate(name=name, country=country, birth_year=birth_year).model_dump())
        initial = [
            ('Мастер и Маргарита', 1, '9785170906307', 1967, 'Классика', 4.8, 5, 3),
            ('Двадцать тысяч лье под водой', 2, '9785171091224', 1870, 'Приключения', 4.6, 4, 2),
            ('Приключения Шерлока Холмса', 3, '9785171132279', 1892, 'Детектив', 4.7, 3, 0),
        ]
        for title, author_id, isbn, year, genre, rating, copies_total, copies_available in initial:
            self.create_book(BookCreate(title=title, author_id=author_id, isbn=isbn, year=year, genre=genre,
                rating=rating, copies_total=copies_total, copies_available=copies_available).model_dump())

    def create_author(self, data: dict[str, Any]) -> dict[str, Any]:
        obj = {'id': self.next_author_id, **data}
        self.authors[self.next_author_id] = obj
        self.next_author_id += 1
        return obj

    def create_book(self, data: dict[str, Any]) -> dict[str, Any]:
        obj = {'id': self.next_book_id, **data}
        self.books[self.next_book_id] = obj
        self.next_book_id += 1
        return obj

    def read_book(self, book_id: int) -> dict[str, Any] | None:
        book = self.books.get(book_id)
        return ({**book, 'available': book['copies_available'] > 0} if book else None)
