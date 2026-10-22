// Чистые функции: не изменяют исходный массив и не обращаются к странице.
export const GENRES = Object.freeze({ roman: 'Роман', klassika: 'Классика', antiutopia: 'Антиутопия', skazka: 'Сказка', fantasy: 'Фэнтези' });

export function filterBooks(books, filters) {
  const query = filters.q.trim().toLocaleLowerCase('ru');
  return books.filter((book) =>
    (!query || `${book.title} ${book.author}`.toLocaleLowerCase('ru').includes(query)) &&
    (!filters.genre || book.genre === filters.genre) &&
    (!filters.availableOnly || book.available > 0)
  );
}

export function sortBooks(books, sort) {
  // [...books] нужен, чтобы sort не изменял аргумент.
  const result = [...books];
  if (sort === 'year') return result.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title, 'ru'));
  if (sort === 'rating') return result.sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title, 'ru'));
  return result.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
}

export function getVisibleBooks(books, filters) {
  return sortBooks(filterBooks(books, filters), filters.sort);
}
