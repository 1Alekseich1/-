from __future__ import annotations
from datetime import date
from sqlalchemy import CheckConstraint, Date, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base

class Author(Base):
    __tablename__ = 'authors'
    __table_args__ = (CheckConstraint('birth_year BETWEEN 1000 AND 2026'),)
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str] = mapped_column(String(80), nullable=False)
    birth_year: Mapped[int] = mapped_column(Integer, nullable=False)
    books: Mapped[list[Book]] = relationship(back_populates='author')

class Genre(Base):
    __tablename__ = 'genres'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

class BookGenre(Base):
    __tablename__ = 'book_genres'
    book_id: Mapped[int] = mapped_column(ForeignKey('books.id', ondelete='CASCADE'), primary_key=True)
    genre_id: Mapped[int] = mapped_column(ForeignKey('genres.id', ondelete='RESTRICT'), primary_key=True)

class Book(Base):
    __tablename__ = 'books'
    __table_args__ = (CheckConstraint('year BETWEEN 1450 AND 2026'), CheckConstraint('rating BETWEEN 0 AND 5'), CheckConstraint('copies_total >= 0'), CheckConstraint('copies_available BETWEEN 0 AND copies_total'),)
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    author_id: Mapped[int] = mapped_column(ForeignKey('authors.id', ondelete='RESTRICT'), nullable=False)
    isbn: Mapped[str] = mapped_column(String(13), unique=True, nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    rating: Mapped[float] = mapped_column(Numeric(3, 2), nullable=False)
    copies_total: Mapped[int] = mapped_column(Integer, nullable=False)
    copies_available: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default='')
    author: Mapped[Author] = relationship(back_populates='books')
    genres: Mapped[list[Genre]] = relationship(secondary='book_genres')

class User(Base):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    password_hash: Mapped[str | None] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), nullable=False, default='member')
    is_active: Mapped[bool] = mapped_column(nullable=False, default=True)
    profile: Mapped[Profile] = relationship(back_populates='user', uselist=False)

class Profile(Base):
    __tablename__ = 'profiles'
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    faculty: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(30))
    user: Mapped[User] = relationship(back_populates='profile')

class Loan(Base):
    __tablename__ = 'loans'
    __table_args__ = (CheckConstraint('due_date >= loan_date'), CheckConstraint('return_date IS NULL OR return_date >= loan_date'),)
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id', ondelete='RESTRICT'), nullable=False)
    book_id: Mapped[int] = mapped_column(ForeignKey('books.id', ondelete='RESTRICT'), nullable=False)
    loan_date: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    return_date: Mapped[date | None] = mapped_column(Date)
