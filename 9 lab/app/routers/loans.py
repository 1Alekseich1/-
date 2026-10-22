from fastapi import APIRouter, HTTPException
from app.core.dependencies import DbDep
from app.core.auth import CurrentUser, Librarian, check_loan_owner
from app.schemas.loans import LoanCreate, LoanRead
from app.services.loans import LoanService

router = APIRouter(prefix='/loans', tags=['Выдачи'])

@router.post('', response_model=LoanRead, status_code=201, responses={409:{'description':'Нет экземпляров'},403:{'description':'Недостаточно прав'}})
def create_loan(data: LoanCreate, db: DbDep, user: CurrentUser) -> LoanRead:
    if user.role != 'librarian' and data.user_id != user.id:
        raise HTTPException(403, 'Можно оформлять только свои выдачи')
    return LoanRead.model_validate(LoanService(db).create(data))

@router.get('', response_model=list[LoanRead], status_code=200)
def all_loans(db: DbDep, librarian: Librarian) -> list[LoanRead]:
    return [LoanRead.model_validate(loan) for loan in LoanService(db).repo.list_all()]

@router.get('/{loan_id}', response_model=LoanRead, status_code=200, responses={404:{'description':'Выдача не найдена'}})
def get_loan(loan_id: int, db: DbDep, user: CurrentUser) -> LoanRead:
    loan = LoanService(db).get(loan_id)
    check_loan_owner(loan, user)
    return LoanRead.model_validate(loan)

@router.patch('/{loan_id}', response_model=LoanRead, status_code=200, responses={404:{'description':'Выдача не найдена'},409:{'description':'Уже возвращена'}})
def return_loan(loan_id: int, db: DbDep, user: CurrentUser) -> LoanRead:
    service = LoanService(db)
    loan = service.get(loan_id)
    check_loan_owner(loan, user)
    return LoanRead.model_validate(service.return_book(loan))
