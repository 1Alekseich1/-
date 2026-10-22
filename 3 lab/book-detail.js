import { books } from './data/books.js';
import { GENRES } from './lib/books.js';
const id = Number(new URLSearchParams(location.search).get('id')) || 1;
const book = books.find((item) => item.id === id);
if (book) {
  document.title = `${book.title} — BookNest`;
  const h1 = document.querySelector('main h1');
  if (h1) h1.textContent = book.title;
  const image = document.querySelector('.book-detail__cover img');
  if (image) { image.src = book.cover; image.alt = `Иллюстративная обложка книги «${book.title}»`; }
  const caption = document.querySelector('.book-detail__cover figcaption');
  if (caption) caption.textContent = `${book.author} — «${book.title}»`;
  const entries = document.querySelectorAll('.spec-list dd');
  if (entries.length >= 7) {
    entries[0].textContent = book.author; entries[1].textContent = book.title;
    entries[2].textContent = GENRES[book.genre]; entries[3].textContent = String(book.year);
    entries[5].textContent = String(book.available); entries[6].textContent = `${book.rating.toFixed(1)} из 5`;
  }
  const crumbs = document.querySelector('.breadcrumbs [aria-current="page"]');
  if (crumbs) crumbs.textContent = book.title;
  const loan = document.querySelector('.book-detail a[href="loan.html"]');
  if (loan) {loan.href = `loan.html?book=${book.id}`; loan.textContent = book.available ? 'Оформить заявку на выдачу' : 'Свободных экземпляров сейчас нет';}
}
