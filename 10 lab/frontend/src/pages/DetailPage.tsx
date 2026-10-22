import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBook } from '../api/books';
import { useFetch } from '../shared/hooks/useFetch';
import { Spinner } from '../components/Spinner';
import { ErrorBox } from '../components/ErrorBox';
import { Badge } from '../components/Badge';
import { useAuth } from '../app/contexts';
import { createLoan } from '../api/loans';
export function DetailPage(){
 const {bookId=''}=useParams();const {user}=useAuth();const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
 const load=useCallback((signal:AbortSignal)=>getBook(bookId,signal),[bookId]);const result=useFetch(load,[load]);
 async function borrow(){if(!user)return;setBusy(true);setMessage('');try{await createLoan(Number(bookId),user.id);setMessage('Книга выдана. Посмотрите раздел «Мои выдачи».');}catch(e:unknown){setMessage(e instanceof Error?e.message:'Ошибка выдачи');}finally{setBusy(false);}}
 return <section className="content-page"><Link to="/books">← Каталог</Link>
 {result.status==='loading'?<Spinner/>:result.status==='error'?<ErrorBox message={result.error} onRetry={()=>window.location.reload()}/>:result.data?<article><h1>{result.data.title}</h1>
 <p><Badge>{result.data.year}</Badge> <Badge tone="positive">Свободных экземпляров: {result.data.editionCount}</Badge></p><p>{result.data.description}</p>
 {user?.role==='librarian'&&<p><Link to={`/books/${bookId}/edit`}>Редактировать</Link></p>}
 {user&&<button type="button" disabled={busy||result.data.editionCount===0} onClick={()=>void borrow()}>Взять книгу на 14 дней</button>}
 {message&&<p role="status">{message}</p>}
 </article>:<p>Книга не найдена</p>}</section>;
}
