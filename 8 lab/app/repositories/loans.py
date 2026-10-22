from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.entities import Book, Loan, User

class LoanRepository:
    def __init__(self, db: Session):
        self.db = db

    def lock_book(self, book_id: int) -> Book | None:
        return self.db.scalar(select(Book).where(Book.id == book_id).with_for_update())

    def get_user(self, user_id: int) -> User | None:
        return self.db.get(User, user_id)

    def get_loan(self, loan_id: int) -> Loan | None:
        return self.db.get(Loan, loan_id)

    def save(self, loan: Loan) -> Loan:
        self.db.add(loan)
        self.db.flush()
        return loan
