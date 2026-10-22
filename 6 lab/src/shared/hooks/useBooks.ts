import { useCallback, useEffect, useState } from 'react';
import { searchBooks } from '../../api/books';
import { errorMessage } from '../../api/client';
import type { Filters, LoadStatus, SearchResult } from '../../types';
interface BooksState { status: LoadStatus; result: SearchResult; message: string; retry: () => void; }
interface InternalState extends Omit<BooksState, 'retry'> { key: string; }
export function useBooks(filters: Filters, page: number, ready: boolean): BooksState {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<InternalState>({ key: '', status: 'loading', result: { books: [], total: 0 }, message: '' });
  const reload = useCallback(() => setAttempt(x => x + 1), []);
  const { q, genre, sort, availableOnly } = filters;
  const key = JSON.stringify([q, genre, sort, availableOnly, page, attempt]);
  useEffect(() => { if (!ready) return;
    const controller = new AbortController(); let active = true;
    void (async () => { try {
      const result = await searchBooks({ q, genre, sort, availableOnly }, page, controller.signal);
      if (active) setState({ key, status: result.books.length ? 'success' : 'empty', result, message: '' });
    } catch (error: unknown) { if (active && !controller.signal.aborted) setState({ key, status: 'error', result: { books: [], total: 0 }, message: errorMessage(error) }); }
    })();
    return () => { active = false; controller.abort(); };
  }, [q, genre, sort, availableOnly, page, ready, attempt, key]);
  return { ...state, status: !ready || state.key !== key ? 'loading' : state.status, retry: reload };
}
