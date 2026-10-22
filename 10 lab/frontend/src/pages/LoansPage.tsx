import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {mine,returnLoan} from '../api/loans';
import type {Loan} from '../api/loans';
import {Spinner} from '../components/Spinner';
import {ErrorBox} from '../components/ErrorBox';
export function LoansPage(){const [loans,setLoans]=useState<Loan[]>([]);const [status,setStatus]=useState<'loading'|'success'|'error'>('loading');const [error,setError]=useState('');
 async function load(){setStatus('loading');try{setLoans(await mine());setStatus('success');}catch(e:unknown){setError(e instanceof Error?e.message:'Ошибка загрузки');setStatus('error');}}
 useEffect(()=>{let active=true;void mine().then(rows=>{if(active){setLoans(rows);setStatus('success');}}).catch(e=>{if(active){setError(e instanceof Error?e.message:'Ошибка');setStatus('error');}});return()=>{active=false;};},[]);
 async function finish(id:number){try{await returnLoan(id);await load();}catch(e:unknown){setError(e instanceof Error?e.message:'Ошибка возврата');setStatus('error');}}
 return <section className="content-page"><h1>Мои выдачи</h1>{status==='loading'?<Spinner/>:status==='error'?<ErrorBox message={error} onRetry={()=>void load()}/>:loans.length===0?<p>Выдач пока нет.</p>:<ul>{loans.map(loan=><li key={loan.id}><Link to={`/books/${loan.book_id}`}>Книга №{loan.book_id}</Link> · до {loan.due_date} · {loan.return_date?'Возвращена':<button onClick={()=>void finish(loan.id)}>Вернуть</button>}</li>)}</ul>}</section>;
}
