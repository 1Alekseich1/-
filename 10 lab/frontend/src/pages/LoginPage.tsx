import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/contexts';
export function LoginPage() {
  const {login,register} = useAuth(); const nav=useNavigate(); const location=useLocation();
  const from=(location.state as {from?:string}|null)?.from ?? sessionStorage.getItem('booknest-intended') ?? '/wishlist';
  const [mode,setMode]=useState<'login'|'register'>('login');
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [error,setError]=useState(''); const [pending,setPending]=useState(false);
  const submit=async(event:FormEvent<HTMLFormElement>):Promise<void>=>{
    event.preventDefault(); setError('');setPending(true);
    try { if(mode==='login') await login(email,password); else await register(name,email,password); sessionStorage.removeItem('booknest-intended');nav(from,{replace:true}); }
    catch(err:unknown){setError(err instanceof Error?err.message:'Не удалось войти');}
    finally{setPending(false);}
  };
  return <section className="content-page"><h1>{mode==='login'?'Вход':'Регистрация'}</h1>
    <form onSubmit={event=>void submit(event)}>
      {mode==='register'&&<p><label>Имя <input required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)}/></label></p>}
      <p><label>Email <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label></p>
      <p><label>Пароль <input type="password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)}/></label></p>
      {error&&<p role="alert">{error}</p>}
      <button type="submit" disabled={pending}>{pending?'Проверка…':mode==='login'?'Войти':'Зарегистрироваться'}</button>
    </form><button type="button" onClick={()=>{setError('');setMode(m=>m==='login'?'register':'login');}}>{mode==='login'?'Создать аккаунт':'Уже есть аккаунт'}</button>
  </section>;
}
