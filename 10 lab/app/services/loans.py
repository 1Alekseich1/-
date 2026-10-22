from datetime import date, timedelta
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.entities import Loan
from app.repositories.loans import LoanRepository
from app.schemas.loans import LoanCreate

class LoanService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = LoanRepository(db)

    def create(self, data: LoanCreate) -> Loan:
        try:
            book = self.repo.lock_book(data.book_id)
            if book is None or self.repo.get_user(data.user_id) is None:
                raise HTTPException(404, 'Книга или читатель не найдены')
            if book.copies_available <= 0:
                raise HTTPException(409, 'Свободных экземпляров нет')
            book.copies_available -= 1
            today = date.today()
            loan = self.repo.save(Loan(user_id=data.user_id, book_id=data.book_id,
                                      loan_date=today, due_date=today + timedelta(days=data.days)))
            self.db.commit()
            self.db.refresh(loan)
            return loan
        except Exception:
            self.db.rollback()
            raise

    def return_book(self, loan: Loan) -> Loan:
        try:
            book = self.repo.lock_book(loan.book_id)
            if book is None:
                raise HTTPException(404, 'Книга не найдена')
            if loan.return_date is not None:
                raise HTTPException(409, 'Книга уже возвращена')
            loan.return_date = date.today()
            book.copies_available += 1
            self.db.commit()
            self.db.refresh(loan)
            return loan
        except Exception:
            self.db.rollback()
            raise

    def get(self, id: int) -> Loan:
        loan = self.repo.get_loan(id)
        if loan is None:
            raise HTTPException(404, 'Выдача не найдена')
        return loan
