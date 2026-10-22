import uuid

def test_health(client):
    c,_=client
    response=c.get('/health');assert response.status_code==200;assert response.headers.get('x-request-id')

def test_catalog(fixtures):
    f=fixtures;response=f['client'].get('/api/v1/books');assert response.status_code==200;assert 'items' in response.json()

def test_not_found(fixtures):
    assert fixtures['client'].get('/api/v1/books/99999999').status_code==404

def test_unauthenticated_create(fixtures):
    assert fixtures['client'].post('/api/v1/books',json={}).status_code==401

def test_member_forbidden(fixtures):
    assert fixtures['client'].post('/api/v1/books',json={},headers=fixtures['member_headers']).status_code==403

def test_validation(fixtures):
    response=fixtures['client'].post('/api/v1/books',json={},headers=fixtures['librarian_headers']);assert response.status_code==422;assert response.json()['code']=='VALIDATION_ERROR'

def test_create_201(fixtures):
    f=fixtures;b=f['book'];data={'title':'Новая книга','author_id':b.author_id,'isbn':'9780000000102','year':2022,'genre':'Классика','rating':4.1,'copies_total':1,'copies_available':1,'description':'Тест'}
    r=f['client'].post('/api/v1/books',json=data,headers=f['librarian_headers']);assert r.status_code==201

def test_duplicate_isbn(fixtures):
    f=fixtures;b=f['book'];data={'title':'Дубликат','author_id':b.author_id,'isbn':b.isbn,'year':2022,'genre':'Классика','rating':4,'copies_total':1,'copies_available':1,'description':''}
    assert f['client'].post('/api/v1/books',json=data,headers=f['librarian_headers']).status_code==409

def test_loan_conflict(fixtures):
    f=fixtures;body={'user_id':f['member'].id,'book_id':f['book'].id,'days':14}
    assert f['client'].post('/api/v1/loans',json=body,headers=f['member_headers']).status_code==201
    assert f['client'].post('/api/v1/loans',json=body,headers=f['member_headers']).status_code==409

def test_foreign_loan_hidden(fixtures):
    f=fixtures;body={'user_id':f['member'].id,'book_id':f['book'].id,'days':14}
    loan=f['client'].post('/api/v1/loans',json=body,headers=f['member_headers']).json()
    assert f['client'].get(f"/api/v1/loans/{loan['id']}",headers=f['other_headers']).status_code==404

def test_return(fixtures):
    f=fixtures;body={'user_id':f['member'].id,'book_id':f['book'].id,'days':14}
    loan=f['client'].post('/api/v1/loans',json=body,headers=f['member_headers']).json()
    assert f['client'].patch(f"/api/v1/loans/{loan['id']}",headers=f['member_headers']).status_code==200
