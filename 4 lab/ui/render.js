// UI не делает fetch: только отображает переданное состояние.
export function render(state, elements) {
  const { status, books, total, page, wishlist } = state;
  elements.status.textContent = status === 'loading' ? 'Загрузка книг…' : status === 'error' ? state.error : status === 'empty' ? 'Ничего не найдено. Измените поиск или сбросьте фильтры.' : `Найдено записей: ${total}`;
  elements.status.setAttribute('role', status === 'error' ? 'alert' : 'status');
  elements.retry.hidden = status !== 'error';
  elements.catalog.replaceChildren();
  if (status === 'success') elements.catalog.append(...books.map((book) => createCard(book, wishlist)));
  elements.pagination.hidden = !['success', 'empty'].includes(status);
  elements.prev.disabled = status !== 'success' || page <= 1;
  elements.next.disabled = status !== 'success' || page * 20 >= total;
  elements.page.textContent = `Страница ${page} из ${Math.max(1, Math.ceil(total / 20))}`;
  elements.wishlistCount.textContent = String(wishlist.length);
  elements.wishlist.replaceChildren(...wishlist.map(createWishItem));
  elements.wishlistEmpty.hidden = wishlist.length > 0;
}
function createCard(book, wishlist) {
  const article = document.createElement('article'); article.className = 'book-card';
  const heading = document.createElement('h3'); heading.className = 'book-card__title';
  const link = document.createElement('a'); link.href = `book.html?id=${encodeURIComponent(book.id)}`; link.textContent = book.title;
  heading.append(link);
  const figure = document.createElement('figure'); figure.className = 'book-card__figure';
  if (book.cover) { const img = document.createElement('img'); img.src = book.cover; img.alt = `Обложка книги «${book.title}»`; img.width = 180; img.height = 250; img.loading = 'lazy'; figure.append(img); }
  const caption = document.createElement('figcaption'); caption.textContent = book.author; figure.append(caption);
  const year = document.createElement('p'); year.textContent = `Первое издание: ${book.year ?? 'неизвестно'}`;
  const rating = document.createElement('p'); rating.textContent = `Рейтинг: ${book.rating == null ? 'нет оценок' : book.rating.toFixed(1) + ' из 5'}`;
  const action = document.createElement('p'); action.className = 'book-card__action book-card__controls';
  const saved = wishlist.some((b) => b.id === book.id);
  const button = document.createElement('button'); button.type = 'button'; button.dataset.action = 'toggle'; button.dataset.id = book.id; button.setAttribute('aria-pressed', String(saved)); button.className = saved ? 'button--saved' : 'button--secondary'; button.textContent = saved ? '✓ В моём списке' : '♡ Хочу прочитать';
  action.append(button); article.append(heading, figure, year, rating, action); return article;
}
function createWishItem(book) {
  const li = document.createElement('li'); li.className = 'wish-item';
  const link = document.createElement('a'); link.href = `book.html?id=${encodeURIComponent(book.id)}`; link.textContent = `${book.title} — ${book.author}`;
  const button = document.createElement('button'); button.type = 'button'; button.className = 'button--secondary'; button.dataset.action = 'remove'; button.dataset.id = book.id; button.textContent = 'Удалить';
  li.append(link, button); return li;
}
