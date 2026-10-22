import { searchBooks } from './api/books.js';
import { getErrorMessage } from './api/client.js';
import { render } from './ui/render.js';
const STORAGE_KEY = 'booknest.lab4.v1';
const defaults = { q: '', genre: '', sort: 'title', availableOnly: false };
function restore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    const filters = parsed?.filters || {};
    return {
      filters: { q: typeof filters.q === 'string' ? filters.q.slice(0, 80) : '', genre: ['','roman','klassika','antiutopia','skazka','fantasy'].includes(filters.genre) ? filters.genre : '', sort: ['title','year','rating'].includes(filters.sort) ? filters.sort : 'title', availableOnly: filters.availableOnly === true },
      wishlist: Array.isArray(parsed?.wishlist) ? parsed.wishlist.filter((b) => b && /^OL\d+W$/.test(b.id) && typeof b.title === 'string' && typeof b.author === 'string').slice(0, 500) : [],
    };
  } catch { return { filters: { ...defaults }, wishlist: [] }; }
}
const saved = restore();
// Единственный объект состояния.
const state = { ...saved, books: [], total: 0, page: 1, status: 'loading', error: '', controller: null, requestId: 0 };
const form = document.querySelector('[data-filters]');
const els = {
  catalog: document.querySelector('[data-results]'), status: document.querySelector('[data-api-status]'),
  retry: document.querySelector('[data-retry]'), pagination: document.querySelector('[data-pagination]'),
  prev: document.querySelector('[data-prev]'), next: document.querySelector('[data-next]'), page: document.querySelector('[data-page]'),
  wishlist: document.querySelector('[data-wishlist]'), wishlistEmpty: document.querySelector('[data-wishlist-empty]'), wishlistCount: document.querySelector('[data-wishlist-count]'),
};
function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ filters: state.filters, wishlist: state.wishlist })); } catch { /* браузер запретил сохранение */ } }
function paint() { render(state, els); }
function syncForm() {
  form.elements.q.value = state.filters.q; form.elements.genre.value = state.filters.genre;
  form.elements.sort.value = state.filters.sort; form.elements.available.checked = state.filters.availableOnly;
}
let debounceTimer;
async function load() {
  state.controller?.abort();
  const controller = new AbortController(); state.controller = controller;
  const id = ++state.requestId;
  // Open Library не знает, какие экземпляры доступны в нашем книжном клубе.
  // Фильтр availability оставлен для совместимости, но отключён как недостоверный.
  state.status = 'loading'; state.error = ''; paint();
  try {
    const result = await searchBooks({ ...state.filters, page: state.page }, controller.signal);
    if (id !== state.requestId) return;
    state.books = result.books; state.total = result.total;
    state.status = result.books.length ? 'success' : 'empty';
  } catch (error) {
    if (error.name === 'AbortError' || id !== state.requestId) return;
    state.status = 'error'; state.error = getErrorMessage(error);
  } finally {
    if (id === state.requestId) { state.controller = null; paint(); }
  }
}
function onFiltersChange() {
  state.filters = { q: form.elements.q.value, genre: form.elements.genre.value, sort: form.elements.sort.value, availableOnly: false };
  state.page = 1; save();
  clearTimeout(debounceTimer);
  state.controller?.abort(); // Отменяем сразу при вводе, не дожидаясь debounce.
  state.requestId++;
  state.status = 'loading'; paint();
  if (state.filters.q.trim().length === 1) {
    state.status = 'empty'; paint();
    els.status.textContent = 'Введите минимум 2 символа для поиска.';
    return;
  }
  debounceTimer = setTimeout(load, 350);
}
form.addEventListener('input', onFiltersChange);
form.addEventListener('change', onFiltersChange);
form.addEventListener('submit', (event) => event.preventDefault());
form.addEventListener('reset', (event) => { event.preventDefault(); clearTimeout(debounceTimer); state.filters = { ...defaults }; state.page = 1; syncForm(); save(); load(); });
els.retry.addEventListener('click', () => load());
els.prev.addEventListener('click', () => { if (state.page > 1) { state.page--; load(); } });
els.next.addEventListener('click', () => { if (state.page * 20 < state.total) { state.page++; load(); } });
document.querySelector('main').addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest('button[data-action][data-id]'); if (!button) return;
  const id = button.dataset.id;
  if (button.dataset.action === 'remove' || state.wishlist.some((b) => b.id === id)) state.wishlist = state.wishlist.filter((b) => b.id !== id);
  else { const book = state.books.find((b) => b.id === id); if (book) state.wishlist = [...state.wishlist, book]; }
  save(); paint();
});
form.elements.available.disabled = true;
form.elements.available.title = 'Open Library не публикует наличие экземпляров университетского клуба';
syncForm(); load();
