import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBook } from '../api/books';
import { useFetch } from '../shared/hooks/useFetch';
import { Spinner } from '../components/Spinner';
import { ErrorBox } from '../components/ErrorBox';
import { Badge } from '../components/Badge';
import { getDraft } from '../api/editor';
export function DetailPage() { const { bookId = '' } = useParams();
  const local = bookId.startsWith('local-') ? getDraft(bookId) : undefined;
  if (local) return <section className="content-page"><Link to="/books">← Каталог</Link><article><h1>{local.title}</h1><p>Автор: {local.author}</p><p>Год: {local.year}</p><p>Экземпляров: {local.copies}</p><p>{local.description}</p><Link to={`/books/${bookId}/edit`}>Редактировать</Link></article></section>;
  return <RemoteDetails bookId={bookId} />;
}
function RemoteDetails({ bookId }: { bookId: string }) {
  const loader = useCallback((signal: AbortSignal) => getBook(bookId, signal), [bookId]);
  const result = useFetch(loader, [loader]);
  return <section className="content-page"><Link to="/books">← Каталог</Link>
    {result.status === 'loading' ? <Spinner label="Загружаем подробности…" /> : result.status === 'error' ? <ErrorBox message={result.error} onRetry={() => window.location.reload()} /> :
      result.data && <article><h1>{result.data.title}</h1>{result.data.cover && <img src={result.data.cover} alt={`Обложка «${result.data.title}»`} width="220" height="320" />}
      <p><Badge>{result.data.year}</Badge> <Badge tone="positive">Изданий: {String(result.data.editionCount)}</Badge></p>
      <p className="details-description">{result.data.description}</p><p><Link to={`/books/${bookId}/edit`}>Редактировать (учебная копия)</Link></p></article>}
  </section>;
}
