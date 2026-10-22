import { request } from './client.js';
export const PAGE_SIZE = 20;
const SUBJECTS = { roman: 'novel', klassika: 'classic', antiutopia: 'dystopia', skazka: 'fairy_tales', fantasy: 'fantasy' };
export function normalizeBook(doc) {
  const workKey = typeof doc.key === 'string' && /^\/works\/OL\d+W$/.test(doc.key) ? doc.key : '';
  return {
    id: workKey.slice('/works/'.length), title: doc.title || 'Без названия',
    author: Array.isArray(doc.author_name) ? doc.author_name.join(', ') : 'Автор не указан',
    year: Number.isInteger(doc.first_publish_year) ? doc.first_publish_year : null,
    cover: Number.isInteger(doc.cover_i) ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : '',
    rating: typeof doc.ratings_average === 'number' ? doc.ratings_average : null,
    // Search API сообщает edition_count, но не наличие экземпляров университетского клуба.
    editionCount: doc.edition_count ?? 0,
  };
}
export async function searchBooks({ q, genre, sort, page }, signal) {
  const terms = [q.trim(), SUBJECTS[genre] ? `subject:${SUBJECTS[genre]}` : ''].filter(Boolean);
  const query = terms.join(' ') || 'popular books';
  const data = await request('/search.json', {
    q: query, page, limit: PAGE_SIZE,
    fields: 'key,title,author_name,first_publish_year,cover_i,edition_count,ratings_average',
    sort: sort === 'year' ? 'new' : undefined,
  }, signal);
  const books = Array.isArray(data.docs) ? data.docs.map(normalizeBook).filter((b) => b.id) : [];
  // Для title и rating сортировка выполняется в пределах страницы (API не предоставляет аналогичный глобальный sort).
  if (sort === 'title') books.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
  if (sort === 'rating') books.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
  return { books, total: Number(data.numFound ?? data.num_found ?? 0) };
}
export async function getBook(id, signal) {
  if (!/^OL\d+W$/.test(id)) throw new Error('Некорректный идентификатор книги');
  const work = `/works/${id}`;
  // Независимые запросы: описание произведения и сведения об изданиях.
  const [book, editions] = await Promise.all([
    request(`${work}.json`, {}, signal), request(`${work}/editions.json`, { limit: 1 }, signal),
  ]);
  const description = typeof book.description === 'string' ? book.description : book.description?.value || 'Описание пока не добавлено.';
  return {
    id, title: book.title || 'Без названия', description,
    cover: book.covers?.[0] ? `https://covers.openlibrary.org/b/id/${book.covers[0]}-L.jpg` : '',
    year: book.first_publish_date || 'Не указан', editionCount: editions.size ?? editions.entries?.length ?? 0,
    subjects: Array.isArray(book.subjects) ? book.subjects.slice(0, 5) : [],
  };
}
