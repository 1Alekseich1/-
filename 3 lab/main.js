import { books } from './data/books.js';
import { render } from './ui/render.js';

const STORAGE_KEY = 'booknest.lab3.v1';
const emptyFilters = () => ({ q: '', genre: '', sort: 'title', availableOnly: false });

function restoreState() {
  const defaults = { filters: emptyFilters(), wishlist: [] };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return defaults;
    const filters = saved.filters && typeof saved.filters === 'object' ? saved.filters : {};
    const validGenres = ['', 'roman', 'klassika', 'antiutopia', 'skazka', 'fantasy'];
    const validSorts = ['title', 'year', 'rating'];
    return {
      filters: {
        q: typeof filters.q === 'string' ? filters.q.slice(0, 80) : '',
        genre: validGenres.includes(filters.genre) ? filters.genre : '',
        sort: validSorts.includes(filters.sort) ? filters.sort : 'title',
        availableOnly: filters.availableOnly === true,
      },
      wishlist: Array.isArray(saved.wishlist) ? [...new Set(saved.wishlist.filter((id) => Number.isInteger(id) && books.some((book) => book.id === id)))] : [],
    };
  } catch {
    return defaults; // Повреждённый JSON не ломает сайт.
  }
}

// Один объект состояния; изменения сохраняются и передаются функции render.
const state = restoreState();
const form = document.querySelector('[data-filters]');
const elements = {
  catalog: document.querySelector('[data-catalog]'),
  resultCount: document.querySelector('[data-result-count]'),
  empty: document.querySelector('[data-empty]'),
  wishlist: document.querySelector('[data-wishlist]'),
  wishlistEmpty: document.querySelector('[data-wishlist-empty]'),
  wishlistCount: document.querySelector('[data-wishlist-count]'),
};

function update() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { /* Приложение остаётся рабочим, если хранилище недоступно. */ }
  render(state, books, elements);
}

function syncForm() {
  form.elements.q.value = state.filters.q;
  form.elements.genre.value = state.filters.genre;
  form.elements.sort.value = state.filters.sort;
  form.elements.available.checked = state.filters.availableOnly;
}

// Оба события проходят через один обработчик формы; поиск моментальный.
function onFiltersChange() {
  state.filters = {
    q: form.elements.q.value,
    genre: form.elements.genre.value,
    sort: form.elements.sort.value,
    availableOnly: form.elements.available.checked,
  };
  update();
}
form.addEventListener('input', onFiltersChange);
form.addEventListener('change', onFiltersChange);
form.addEventListener('submit', (event) => event.preventDefault());
form.addEventListener('reset', (event) => {
  event.preventDefault(); state.filters = emptyFilters(); syncForm(); update();
});

// Делегирование: один слушатель для всех карточек и элементов списка.
document.querySelector('main').addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest('button[data-action][data-id]');
  if (!button) return;
  const id = Number(button.dataset.id);
  if (!books.some((book) => book.id === id)) return;
  const hasBook = state.wishlist.includes(id);
  if (button.dataset.action === 'remove-wish' || hasBook) {
    state.wishlist = state.wishlist.filter((item) => item !== id);
  } else {
    state.wishlist = [...state.wishlist, id];
  }
  update();
});
syncForm();
update();
