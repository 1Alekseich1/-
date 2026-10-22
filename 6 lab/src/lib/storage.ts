import type { SavedBook } from '../types';
const KEY = 'booknest-wishlist-v5';
export function loadWishlist(): SavedBook[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    if (!Array.isArray(raw)) return [];
    return raw.filter((item): item is SavedBook => typeof item === 'object' && item !== null &&
      typeof item.id === 'string' && /^OL\d+W$/.test(item.id) && typeof item.title === 'string' &&
      typeof item.author === 'string' && typeof item.cover === 'string');
  } catch { return []; }
}
export function saveWishlist(books: SavedBook[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(books)); }
  catch { /* При запрете хранилища список остаётся доступен до обновления страницы. */ }
}
