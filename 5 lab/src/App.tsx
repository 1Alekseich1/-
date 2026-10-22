import { useEffect, useMemo, useState } from 'react';
import { getBook, PAGE_SIZE, searchBooks } from './api/books';
import { errorMessage } from './api/client';
import { BookDetails } from './components/BookDetails';
import { BookList } from './components/BookList';
import { EmptyState } from './components/EmptyState';
import { ErrorBox } from './components/ErrorBox';
import { FiltersPanel } from './components/FiltersPanel';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Pagination } from './components/Pagination';
import { Spinner } from './components/Spinner';
import { Wishlist } from './components/Wishlist';
import { toSavedBook, toggleWishlist } from './lib/books';
import { loadWishlist, saveWishlist } from './lib/storage';
import { useDebounce } from './lib/useDebounce';
import type { Book, BookDetails as Details, Filters, LoadStatus, PageMode, SavedBook } from './types';

const DEFAULT_FILTERS: Filters = { q: '', genre: '', sort: 'relevance', availableOnly: false };
interface CatalogState { status: LoadStatus; books: Book[]; total: number; message: string; }
interface DetailState { status: LoadStatus; book: Details | null; message: string; }

export default function App() {
  const [mode, setMode] = useState<PageMode>('catalog');
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [wishlist, setWishlist] = useState<SavedBook[]>(loadWishlist);
  const [catalog, setCatalog] = useState<CatalogState>({ status: 'loading', books: [], total: 0, message: '' });
  const [detailId, setDetailId] = useState<string | null>(null);
  const [details, setDetails] = useState<DetailState>({ status: 'loading', book: null, message: '' });
  const [retry, setRetry] = useState(0);
  const [detailRetry, setDetailRetry] = useState(0);
  const debouncedQuery = useDebounce(filters.q, 350);
  const savedIds = useMemo(() => new Set(wishlist.map(book => book.id)), [wishlist]);
  const queryReady = filters.q.length === 0 || filters.q.trim().length >= 2;

  useEffect(() => { saveWishlist(wishlist); }, [wishlist]);
  useEffect(() => {
    if (!queryReady || filters.q !== debouncedQuery) return;
    const controller = new AbortController();
    // Отмена прошлого запроса при изменении параметров и размонтировании.
    // Состояние загрузки включается сразу в событии изменения фильтра/страницы.
    void (async () => {
      try {
        const result = await searchBooks({ ...filters, q: debouncedQuery }, page, controller.signal);
        if (!controller.signal.aborted) setCatalog({ status: result.books.length ? 'success' : 'empty', books: result.books, total: result.total, message: '' });
      } catch (error: unknown) {
        if (!controller.signal.aborted) setCatalog({ status: 'error', books: [], total: 0, message: errorMessage(error) });
      }
    })();
    return () => controller.abort();
  }, [debouncedQuery, filters, page, retry, queryReady]);

  useEffect(() => {
    if (!detailId) return;
    const controller = new AbortController();
    void (async () => {
      try { const book = await getBook(detailId, controller.signal);
        if (!controller.signal.aborted) setDetails({ status: 'success', book, message: '' }); }
      catch (error: unknown) { if (!controller.signal.aborted) setDetails({ status: 'error', book: null, message: errorMessage(error) }); }
    })();
    return () => controller.abort();
  }, [detailId, detailRetry]);

  const changeFilters = (next: Filters) => {
    setFilters(next); setPage(1);
    setCatalog(current => ({ ...current, status: 'loading' }));
  };
  const changePage = (next: number) => {
    setPage(next); setCatalog(current => ({ ...current, status: 'loading' }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goDetail = (id: string) => { setDetailId(id); setDetails({ status: 'loading', book: null, message: '' }); };
  const toggleBook = (book: Book) => setWishlist(current => toggleWishlist(current, toSavedBook(book)));
  const removeBook = (book: SavedBook) => setWishlist(current => current.filter(item => item.id !== book.id));
  const navigate = (next: PageMode) => { setDetailId(null); setMode(next); };
  const reset = () => changeFilters(DEFAULT_FILTERS);
  const retryCatalog = () => { setCatalog(current => ({ ...current, status: 'loading' })); setRetry(count => count + 1); };
  const retryDetails = () => { setDetails({ status: 'loading', book: null, message: '' }); setDetailRetry(count => count + 1); };

  return <div className="page"><a className="skip-link" href="#content">Перейти к содержимому</a>
    <Header mode={mode} count={wishlist.length} onNavigate={navigate} />
    <main className="page-main page-main--react" id="content">
      {detailId ? <>
        {details.status === 'loading' && <Spinner label="Загружаем сведения о книге…" />}
        {details.status === 'error' && <ErrorBox message={details.message} onRetry={retryDetails} />}
        {details.status === 'success' && details.book && <BookDetails book={details.book} onBack={() => setDetailId(null)} />}
      </> : mode === 'wishlist' ? <Wishlist books={wishlist} onRemove={removeBook} onDetails={goDetail} onCatalog={() => navigate('catalog')} /> : <>
        <h1>Каталог книг BookNest</h1><p>Ищите книги в открытом каталоге Open Library и сохраняйте интересные в свой список.</p>
        <div className="catalog-shell"><FiltersPanel filters={filters} onChange={changeFilters} onReset={reset} />
          <section className="catalog-shell__content" aria-label="Книжный каталог">
            {!queryReady ? <EmptyState title="Введите ещё символ" description="Для поиска необходимо не менее двух символов." onReset={reset} /> : <>
              {catalog.status === 'loading' && <Spinner />}
              {catalog.status === 'error' && <ErrorBox message={catalog.message} onRetry={retryCatalog} />}
              {catalog.status === 'empty' && <EmptyState title="Ничего не найдено" description="Попробуйте изменить жанр или поисковый запрос." onReset={reset} />}
              {catalog.status === 'success' && <><p role="status">Найдено: {catalog.total.toLocaleString('ru-RU')} книг</p>
                <BookList books={catalog.books} savedIds={savedIds} onToggle={toggleBook} onDetails={goDetail} />
                <Pagination page={page} total={catalog.total} pageSize={PAGE_SIZE} onChange={changePage} /></>}
            </>}
          </section></div>
      </>}
    </main><Footer /></div>;
}
