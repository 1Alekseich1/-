import { Link } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
export function NotFoundPage() { return <section className="content-page"><h1>404 — страница не найдена</h1>
  <EmptyState title="Такой страницы нет" description="Вернитесь в каталог и продолжите поиск." /><Link to="/books">В каталог</Link></section>; }
