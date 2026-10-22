from sqlalchemy import func, select, or_
from sqlalchemy.orm import Session, selectinload
from app.models.entities import Author, Book, Genre, Loan, User
from app.schemas.books import BookCreate, BookUpdate
from app.schemas.authors import AuthorCreate, AuthorUpdate

class CatalogRepository:
    def __init__(self, db: Session):
        self.db = db

    def book(self, id: int) -> Book | None:
        return self.db.scalar(select(Book).options(selectinload(Book.genres), selectinload(Book.author)).where(Book.id == id))

    def author(self, id: int) -> Author | None:
        return self.db.get(Author, id)

    def genre(self, name: str) -> Genre | None:
        return self.db.scalar(select(Genre).where(Genre.name == name))

    def books(self, q: str | None, genre: str | None, available_only: bool, sort: str, page: int, size: int) -> tuple[list[Book], int]:
        stmt = select(Book).join(Author).options(selectinload(Book.genres), selectinload(Book.author))
        if q:
            stmt = stmt.where(or_(Book.title.ilike(f'%{q}%'), Author.name.ilike(f'%{q}%')))
        if genre:
            stmt = stmt.where(Book.genres.any(Genre.name == genre))
        if available_only:
            stmt = stmt.where(Book.copies_available > 0)
        total = self.db.scalar(select(func.count()).select_from(stmt.order_by(None).subquery())) or 0
        column = {'title': Book.title, 'year': Book.year, 'rating': Book.rating}[sort.lstrip('-')]
        order = column.desc() if sort.startswith('-') else column.asc()
        rows = self.db.scalars(stmt.order_by(order, Book.id.asc()).offset((page - 1) * size).limit(size)).all()
        return list(rows), total

    def authors(self, q: str | None, page: int, size: int) -> tuple[list[Author], int]:
        stmt = select(Author)
        if q:
            stmt = stmt.where(Author.name.ilike(f'%{q}%'))
        total = self.db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
        return list(self.db.scalars(stmt.order_by(Author.name, Author.id).offset((page - 1) * size).limit(size)).all()), total

    def author_books(self, id: int) -> list[Book]:
        return list(self.db.scalars(select(Book).options(selectinload(Book.genres), selectinload(Book.author)).where(Book.author_id == id).order_by(Book.id)).all())

    def isbn_exists(self, isbn: str, exclude: int | None = None) -> bool:
        stmt = select(Book.id).where(Book.isbn == isbn)
        if exclude is not None:
            stmt = stmt.where(Book.id != exclude)
        return self.db.scalar(stmt.limit(1)) is not None

    def book_has_loans(self, id: int) -> bool:
        return self.db.scalar(select(Loan.id).where(Loan.book_id == id).limit(1)) is not None

    def author_has_books(self, id: int) -> bool:
        return self.db.scalar(select(Book.id).where(Book.author_id == id).limit(1)) is not None
