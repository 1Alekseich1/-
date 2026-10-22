import { getBook } from './api/books.js';
import { getErrorMessage } from './api/client.js';
const params = new URLSearchParams(location.search);
const id = params.get('id') || '';
const main = document.querySelector('main');
const status = document.createElement('p'); status.setAttribute('role', 'status');
const display = document.createElement('section'); display.className = 'book-detail';
main.replaceChildren(status, display);
function add(tag, value, parent = display) { const item = document.createElement(tag); item.textContent = value; parent.append(item); return item; }
async function load() {
  status.textContent = 'Загрузка информации о книге…'; display.replaceChildren();
  const controller = new AbortController();
  try {
    const book = await getBook(id, controller.signal);
    document.title = `${book.title} — BookNest`;
    add('h1', book.title);
    const back = document.createElement('a'); back.href = 'index.html'; back.textContent = '← Вернуться к каталогу'; display.append(back);
    if (book.cover) { const figure = document.createElement('figure'); const img = document.createElement('img'); img.src = book.cover; img.alt = `Обложка книги «${book.title}»`; img.width = 180; img.height = 250; figure.append(img); display.append(figure); }
    add('h2', 'Описание'); add('p', book.description);
    add('h2', 'Характеристики'); const dl = document.createElement('dl');
    for (const [name, value] of [['Дата первого издания', book.year], ['Количество известных изданий', book.editionCount], ['Темы', book.subjects.join(', ') || 'Нет данных']]) { const dt = document.createElement('dt'); dt.textContent = name; const dd = document.createElement('dd'); dd.textContent = String(value); dl.append(dt,dd); } display.append(dl);
    status.textContent = '';
  } catch (error) {
    if (error.name === 'AbortError') return;
    status.textContent = getErrorMessage(error); status.setAttribute('role','alert');
    const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Повторить'; button.addEventListener('click',load); display.append(button);
  } finally { /* Индикатор загрузки заменяется результатом или ошибкой. */ }
}
load();
