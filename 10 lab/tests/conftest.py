import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.main import app
from app.models.entities import Author, Book, User, Genre
from app.core.security import hash_password

@pytest.fixture
def client():
    url=os.environ.get('TEST_DATABASE_URL')
    if not url or 'booknest_test' not in url:
        pytest.skip('TEST_DATABASE_URL must point to booknest_test database')
    engine=create_engine(url)
    connection=engine.connect()
    outer=connection.begin()
    db=Session(bind=connection,join_transaction_mode='create_savepoint',expire_on_commit=False)
    def override():
        yield db
    app.dependency_overrides[get_db]=override
    try:
        with TestClient(app) as c:
            yield c,db
    finally:
        app.dependency_overrides.clear()
        db.close()
        outer.rollback()
        connection.close()
        engine.dispose()

@pytest.fixture
def fixtures(client):
    c,db=client
    member=User(email='member10@example.test',full_name='Member',password_hash=hash_password('Testpass123'),role='member',is_active=True)
    other=User(email='other10@example.test',full_name='Other',password_hash=hash_password('Testpass123'),role='member',is_active=True)
    librarian=User(email='librarian10@example.test',full_name='Librarian',password_hash=hash_password('Testpass123'),role='librarian',is_active=True)
    author=Author(name='Тестовый автор',country='Казахстан',birth_year=1980)
    db.add_all([member,other,librarian,author]);db.commit()
    book=Book(title='Тестовая книга',author_id=author.id,isbn='9780000000101',year=2020,rating=4,copies_total=1,copies_available=1,description='Учебная книга')
    genre=db.query(Genre).filter(Genre.name=='Классика').first()
    if genre is None:
        genre=Genre(name='Классика');db.add(genre);db.flush()
    book.genres=[genre]
    db.add(book);db.commit()
    def token(email):
        response=c.post('/auth/token',data={'username':email,'password':'Testpass123'})
        return {'Authorization':'Bearer '+response.json()['access_token']}
    return {'client':c,'member':member,'other':other,'librarian':librarian,'book':book,'author':author,'member_headers':token(member.email),'other_headers':token(other.email),'librarian_headers':token(librarian.email)}
