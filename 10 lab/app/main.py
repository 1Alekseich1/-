import logging
import time
import uuid
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.core.errors import setup_errors
from app.routers import auth, authors, books, loans

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('booknest')
app = FastAPI(title='BookNest API', version='4.0.0')
setup_errors(app)
app.add_middleware(CORSMiddleware, allow_origins=[o.strip() for o in settings.cors_origins.split(',') if o.strip()], allow_credentials=True, allow_methods=['GET','POST','PATCH','DELETE'], allow_headers=['Authorization','Content-Type'])

@app.middleware('http')
async def request_info(request: Request, call_next):
    request.state.request_id = str(uuid.uuid4())
    start = time.perf_counter()
    response: Response = await call_next(request)
    response.headers['X-Request-ID'] = request.state.request_id
    logger.info('request_id=%s %s %s %d %.1fms', request.state.request_id, request.method, request.url.path, response.status_code, (time.perf_counter()-start)*1000)
    return response

@app.get('/health',response_model=dict[str,str])
def health() -> dict[str,str]:
    return {'status':'ok'}

app.include_router(auth.router)
for router in (books.router, authors.router, loans.router):
    app.include_router(router,prefix='/api/v1')
