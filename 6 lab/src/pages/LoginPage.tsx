import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/contexts';
import { Button } from '../components/Button';
export function LoginPage() { const { login, signedIn } = useAuth(); const nav = useNavigate();
  const location = useLocation(); const from = (location.state as { from?: string } | null)?.from ?? '/wishlist';
  return <section className="content-page"><h1>Учебный вход</h1><p>Это заглушка до ЛР №9. Пароль и сервер пока не нужны.</p>
    <Button onClick={() => { login(); nav(from, { replace: true }); }}>{signedIn ? 'Продолжить' : 'Войти как читатель'}</Button></section>;
}
