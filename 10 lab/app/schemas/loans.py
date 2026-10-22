from datetime import date
from pydantic import BaseModel, Field, ConfigDict

class LoanCreate(BaseModel):
    user_id: int = Field(gt=0)
    book_id: int = Field(gt=0)
    days: int = Field(default=14, ge=1, le=60)

class LoanRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    book_id: int
    loan_date: date
    due_date: date
    return_date: date | None
