from pydantic import BaseModel, ConfigDict, Field, field_validator

class AuthorBase(BaseModel):
    name: str = Field(min_length=2, max_length=100, examples=['Михаил Булгаков'])
    country: str = Field(min_length=2, max_length=80, examples=['Россия'])
    birth_year: int = Field(ge=1000, le=2026, examples=[1891])

    @field_validator('name', 'country')
    @classmethod
    def meaningful_text(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 2:
            raise ValueError('Введите не менее двух непробельных символов')
        return cleaned

class AuthorCreate(AuthorBase):
    pass

class AuthorUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    country: str | None = Field(default=None, min_length=2, max_length=80)
    birth_year: int | None = Field(default=None, ge=1000, le=2026)

    @field_validator('name', 'country')
    @classmethod
    def meaningful_text(cls, value: str | None) -> str | None:
        return AuthorBase.meaningful_text(value) if value is not None else None

class AuthorRead(AuthorBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
