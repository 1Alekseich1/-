from fastapi import APIRouter
from app.core.dependencies import DbDep
from app.schemas.loans import LoanCreate, LoanRead
from app.services.loans import LoanService

router = APIRouter(prefix='/loans', tags=['Выдачи'])

@router.post('', response_model=LoanRead, status_code=201, responses={404: {'description': 'Нет книги/читателя'}, 409: {'description': 'Нет свободных экземпляров'}})
def create_loan(data: LoanCreate, db: DbDep) -> LoanRead:
    return LoanRead.model_validate(LoanService(db).create(data))

@router.get('/{loan_id}', response_model=LoanRead, status_code=200, responses={404: {'description': 'Не найдено'}})
def get_loan(loan_id: int, db: DbDep) -> LoanRead:
    return LoanRead.model_validate(LoanService(db).get(loan_id))
