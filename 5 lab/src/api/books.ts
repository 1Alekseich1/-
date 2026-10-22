import { request } from './client';
import type { Book, BookDetails, Filters, SearchResult } from '../types';
export const PAGE_SIZE = 20;
const SUBJECTS: Record<Exclude<Filters['genre'], ''>, string> = {
  roman: 'novel', klassika: 'classic', antiutopia: 'dystopia', skazka: 'fairy_tales', fantasy: 'fantasy'
};
interface SearchDoc { key?: string; title?: string; author_name?: string[]; first_publish_year?: number; cover_i?: number; ratings_average?: number; edition_count?: number; }
interface SearchResponse { docs?: SearchDoc[]; numFound?: number; num_found?: number; }
interface WorkResponse { title?: string; description?: string | { value?: string }; covers?: number[]; first_publish_date?: string; subjects?: string[]; }
interface EditionsResponse { size?: number; entries?: unknown[]; }
export function normalizeBook(doc: SearchDoc): Book | null {
  if (!doc.key || !/^\/works\/OL\d+W$/.test(doc.key)) return null;
  return { id: doc.key.slice(7), title: doc.title ?? 'Без названия',
    author: doc.author_name?.join(', ') || 'Автор неизвестен',
    year: Number.isInteger(doc.first_publish_year) ? doc.first_publish_year ?? null : null,
    cover: Number.isInteger(doc.cover_i) ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : '',
    rating: typeof doc.ratings_average === 'number' ? doc.ratings_average : null,
    editionCount: doc.edition_count ?? 0 };
}
export async function searchBooks(filters: Filters, page: number, signal?: AbortSignal): Promise<SearchResult> {
  const query = [filters.q.trim(), filters.genre ? `subject:${SUBJECTS[filters.genre]}` : ''].filter(Boolean).join(' ') || 'popular books';
  const data = await request<SearchResponse>('/search.json', { q: query, page, limit: PAGE_SIZE,
    fields: 'key,title,author_name,first_publish_year,cover_i,edition_count,ratings_average',
    sort: filters.sort === 'year' ? 'new' : undefined }, signal);
  const books = (data.docs ?? []).map(normalizeBook).filter((book): book is Book => book !== null);
  // Open Library не знает о наличии книг в университетской библиотеке.
  const sorted = [...books];
  if (filters.sort === 'title') sorted.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
  if (filters.sort === 'rating') sorted.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
  return { books: sorted, total: Math.max(0, data.numFound ?? data.num_found ?? 0) };
}
export async function getBook(id: string, signal?: AbortSignal): Promise<BookDetails> {
  if (!/^OL\d+W$/.test(id)) throw new Error('Некорректный ID книги');
  const [work, editions] = await Promise.all([
    request<WorkResponse>(`/works/${id}.json`, {}, signal),
    request<EditionsResponse>(`/works/${id}/editions.json`, { limit: 1 }, signal)
  ]);
  const description = typeof work.description === 'string' ? work.description : work.description?.value ?? 'Нет описания.';
  const cover = work.covers?.[0];
  return { id, title: work.title ?? 'Без названия', description,
    cover: cover ? `https://covers.openlibrary.org/b/id/${cover}-L.jpg` : '',
    year: work.first_publish_date ?? 'Не указан', editionCount: editions.size ?? editions.entries?.length ?? 0,
    subjects: work.subjects?.slice(0, 6) ?? [] };
}
