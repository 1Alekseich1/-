import logging
import uuid
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
logger = logging.getLogger('booknest')

def setup_errors(app: FastAPI) -> None:
    @app.exception_handler(HTTPException)
    async def http_error(request: Request, exc: HTTPException) -> JSONResponse:
        return JSONResponse(status_code=exc.status_code, content={'code':f'HTTP_{exc.status_code}', 'message':str(exc.detail), 'details':{}, 'request_id':request.state.request_id}, headers=exc.headers)

    @app.exception_handler(RequestValidationError)
    async def validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
        fields = [{'field':'.'.join(str(part) for part in item['loc'] if part!='body'), 'message':item['msg']} for item in exc.errors()]
        return JSONResponse(status_code=422, content={'code':'VALIDATION_ERROR', 'message':'Проверьте поля формы', 'details':fields, 'request_id':request.state.request_id})

    @app.exception_handler(IntegrityError)
    async def integrity_error(request: Request, exc: IntegrityError) -> JSONResponse:
        logger.warning('Constraint conflict %s', request.state.request_id)
        return JSONResponse(status_code=409, content={'code':'CONFLICT', 'message':'Конфликт данных', 'details':{}, 'request_id':request.state.request_id})

    @app.exception_handler(Exception)
    async def internal_error(request: Request, exc: Exception) -> JSONResponse:
        logger.exception('Internal error request_id=%s', request.state.request_id)
        return JSONResponse(status_code=500,content={'code':'INTERNAL_ERROR','message':'Внутренняя ошибка сервера','details':{},'request_id':request.state.request_id})
