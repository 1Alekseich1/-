from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

Genre = Literal['Фантастика', 'Классика', 'Детектив', 'Научная', 'Приключения']
Sort = Literal['title', '-title', 'year', '-year', 'rating', '-rating']

class BookBase(BaseModel):
    title: str = Field(min_length=1, max_length=150, examples=['Мастер и Маргарита'])
    author_id: int = Field(ge=1, examples=[1])
    isbn: str = Field(pattern=r'^\d{13}$', examples=['9785170906307'])
    year: int = Field(ge=1450, le=2026, examples=[1967])
    genre: Genre = Field(examples=['Классика'])
    rating: float = Field(ge=0, le=5, examples=[4.8])
    copies_total: int = Field(ge=0, le=10000, examples=[4])
    copies_available: int = Field(ge=0, le=10000, examples=[2])
    description: str = Field(default='', max_length=3000)

    @field_validator('title')
    @classmethod
    def title_not_whitespace(cls, value: str) -> str:
        text = value.strip()
        if not text:
            raise ValueError('Название не может состоять из пробелов')
        return text

    @model_validator(mode='after')
    def valid_stock(self) -> 'BookBase':
        if self.copies_available > self.copies_total:
            raise ValueError('Свободных экземпляров не может быть больше общего количества')
        return self

class BookCreate(BookBase):
    pass

class BookUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=150)
    author_id: int | None = Field(default=None, ge=1)
    isbn: str | None = Field(default=None, pattern=r'^\d{13}$')
    year: int | None = Field(default=None, ge=1450, le=2026)
    genre: Genre | None = None
    rating: float | None = Field(default=None, ge=0, le=5)
    copies_total: int | None = Field(default=None, ge=0, le=10000)
    copies_available: int | None = Field(default=None, ge=0, le=10000)
    description: str | None = Field(default=None, max_length=3000)

    @field_validator('title')
    @classmethod
    def title_not_whitespace(cls, value: str | None) -> str | None:
        return BookBase.title_not_whitespace(value) if value is not None else None

class BookRead(BookBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    available: bool
