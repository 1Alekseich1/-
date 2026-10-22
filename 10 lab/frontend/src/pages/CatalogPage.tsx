import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiltersPanel } from '../components/FiltersPanel';
import { Spinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { ErrorBox } from '../components/ErrorBox';
import { BookList } from '../components/BookList';
import { Pagination } from '../components/Pagination';
import { PAGE_SIZE } from '../api/books';
import { useDebounce } from '../shared/hooks/useDebounce';
import { useBooks } from '../shared/hooks/useBooks';
import { listSaved, toggleSaved } from '../features/wishlist';
import type { Filters, Genre, SortMode } from '../types';
const DEFAULT: Filters = { q: '', genre: '', sort: 'relevance', availableOnly: false };
const GENRES = ['', 'roman', 'klassika', 'antiutopia', 'skazka', 'fantasy'];
const SORTS = ['relevance', 'title', 'year', 'rating'];
export function CatalogPage() {
  const [params, setParams] = useSearchParams(); const navigate = useNavigate();
  const [saved, setSaved] = useState(listSaved);
  const q = params.get('q') ?? '';
  const filters: Filters = { q, genre: GENRES.includes(params.get('genre') ?? '') ? (params.get('genre') ?? '') as Genre : '',
    sort: SORTS.includes(params.get('sort') ?? '') ? (params.get('sort') ?? 'relevance') as SortMode : 'relevance', availableOnly: params.get('available') === '1' };
  const page = Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1);
  const debounced = useDebounce(q, 350);
  const ready = !q || (q.trim().length >= 2 && debounced === q);
  const result = useBooks({ ...filters, q: debounced }, page, ready);
  const change = (next: Filters, nextPage = 1) => { const url = new URLSearchParams();
    if (next.q) url.set('q', next.q); if (next.genre) url.set('genre', next.genre);
    if (next.sort !== 'relevance') url.set('sort', next.sort); if(next.availableOnly) url.set('available','1');
    if (nextPage > 1) url.set('page', String(nextPage)); setParams(url);
  };
  const ids = new Set(saved.map(b => b.id));
  return <section className="catalog-shell"><FiltersPanel filters={filters} onChange={change} onReset={() => change(DEFAULT)} />
    <section className="catalog-shell__content"><header><h1>Каталог книг</h1><p>Книги университета. Поиск, фильтры и страница сохраняются в ссылке.</p></header>
      {q.trim().length === 1 ? <EmptyState title="Введите минимум 2 символа" description="Продолжите ввод названия или автора." /> : !ready ? <Spinner label="Ожидаем завершения ввода…" /> :
       result.status === 'loading' ? <Spinner /> : result.status === 'error' ? <ErrorBox message={result.message} onRetry={result.retry} /> :
       result.status === 'empty' ? <EmptyState title="Книги не найдены" description="Попробуйте другой запрос или сбросьте фильтры." onReset={() => change(DEFAULT)} /> :
       <><p role="status">Найдено: {result.result.total}</p><BookList books={result.result.books} savedIds={ids}
          onToggle={book => setSaved(toggleSaved(book))} onDetails={id => navigate(`/books/${id}`)} />
          <Pagination page={page} total={result.result.total} pageSize={PAGE_SIZE} onChange={number => change(filters, number)} /></>}
    </section></section>;
}
