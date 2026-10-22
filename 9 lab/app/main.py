import logging
import time
from collections.abc import Awaitable, Callable
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth
from app.routers import authors, books, loans

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('booknest')
app = FastAPI(title='BookNest API', version='3.0.0', description='Каталог с JWT и ролевым доступом')
app.add_middleware(CORSMiddleware, allow_origins=[origin.strip() for origin in settings.cors_origins.split(',') if origin.strip()], allow_credentials=True, allow_methods=['GET','POST','PATCH','DELETE'], allow_headers=['Authorization','Content-Type'])
app.include_router(auth.router)

@app.middleware('http')
async def log_requests(request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
    start = time.perf_counter()
    response = await call_next(request)
    logger.info('%s %s -> %d %.1f ms', request.method, request.url.path,
                response.status_code, (time.perf_counter() - start) * 1000)
    return response

@app.get('/health', response_model=dict[str, str], status_code=200)
def health() -> dict[str, str]:
    return {'status': 'ok'}

for router in (books.router, authors.router, loans.router):
    app.include_router(router, prefix='/api/v1')
