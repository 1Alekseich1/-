import { GENRES, getVisibleBooks } from '../lib/books.js';

// Вся отрисовка страницы выполняется только здесь, на основании state.
export function render(state, books, elements) {
  const visible = getVisibleBooks(books, state.filters);
  elements.resultCount.textContent = `Найдено книг: ${visible.length} из ${books.length}`;
  elements.wishlistCount.textContent = String(state.wishlist.length);
  elements.empty.hidden = visible.length !== 0;
  elements.catalog.replaceChildren(...visible.map((book) => createCard(book, state.wishlist)));
  const desired = state.wishlist.map((id) => books.find((book) => book.id === id)).filter(Boolean);
  elements.wishlist.replaceChildren(...desired.map((book) => createWishItem(book)));
  elements.wishlistEmpty.hidden = desired.length !== 0;
}

function createCard(book, wishlist) {
  const article = document.createElement('article');
  article.className = 'book-card';
  const heading = document.createElement('h3'); heading.className = 'book-card__title';
  const link = document.createElement('a'); link.href = `book.html?id=${book.id}`; link.textContent = book.title;
  heading.append(link);
  const figure = document.createElement('figure'); figure.className = 'book-card__figure';
  const img = document.createElement('img'); img.className = 'book-card__image'; img.src = book.cover;
  img.alt = `Иллюстративная обложка книги «${book.title}»`; img.width = 180; img.height = 250;
  const caption = document.createElement('figcaption'); caption.textContent = book.author;
  figure.append(img, caption);
  const meta = document.createElement('p'); meta.textContent = `Жанр: ${GENRES[book.genre]}. Год: ${book.year}.`;
  const rating = document.createElement('p'); rating.textContent = `Рейтинг: ${book.rating.toFixed(1)} из 5.`;
  const available = document.createElement('p'); available.textContent = `Свободных экземпляров: ${book.available}.`;
  const controls = document.createElement('p'); controls.className = 'book-card__action book-card__controls';
  const active = wishlist.includes(book.id);
  const button = document.createElement('button'); button.type = 'button'; button.dataset.action = 'toggle-wish';
  button.dataset.id = String(book.id); button.setAttribute('aria-pressed', String(active));
  button.className = active ? 'button--saved' : 'button--secondary';
  button.textContent = active ? '✓ В моём списке' : '♡ Хочу прочитать';
  const details = document.createElement('a'); details.className = 'button-link';
  details.href = book.available > 0 ? `loan.html?book=${book.id}` : `book.html?id=${book.id}`;
  details.textContent = book.available > 0 ? 'Подать заявку' : 'Подробнее';
  controls.append(button, details); article.append(heading, figure, meta, rating, available, controls);
  return article;
}

function createWishItem(book) {
  const item = document.createElement('li'); item.className = 'wish-item';
  const link = document.createElement('a'); link.href = `book.html?id=${book.id}`; link.textContent = `${book.title} — ${book.author}`;
  const remove = document.createElement('button'); remove.type = 'button'; remove.dataset.action = 'remove-wish';
  remove.dataset.id = String(book.id); remove.className = 'button--secondary'; remove.textContent = 'Удалить';
  remove.setAttribute('aria-label', `Удалить из списка: ${book.title}`);
  item.append(link, remove); return item;
}
