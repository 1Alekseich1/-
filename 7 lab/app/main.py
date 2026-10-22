import logging
import time
from contextlib import asynccontextmanager
from collections.abc import AsyncIterator
from fastapi import FastAPI, Request, Response
from collections.abc import Awaitable, Callable
from app.config import API_PREFIX
from app.repositories.memory import MemoryRepository
from app.routers import authors, books

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('booknest')

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.repository = MemoryRepository()
    yield

app = FastAPI(title='BookNest API', version='1.0.0',
              description='Учебный REST API книжного клуба. Данные хранятся в оперативной памяти.', lifespan=lifespan)

@app.middleware('http')
async def log_requests(request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
    started = time.perf_counter()
    response = await call_next(request)
    elapsed = (time.perf_counter() - started) * 1000
    logger.info('%s %s -> %s (%.1f ms)', request.method, request.url.path, response.status_code, elapsed)
    return response

@app.get('/health', response_model=dict[str, str], status_code=200, tags=['Система'])
def health() -> dict[str, str]:
    return {'status': 'ok'}

app.include_router(books.router, prefix=API_PREFIX)
app.include_router(authors.router, prefix=API_PREFIX)
