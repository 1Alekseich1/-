import type { Book, SavedBook } from '../types';
import { loadWishlist, saveWishlist } from '../lib/storage';
export function listSaved(): SavedBook[] { return loadWishlist(); }
export function toggleSaved(book: Book): SavedBook[] {
  const old = loadWishlist();
  const next = old.some(b => b.id === book.id) ? old.filter(b => b.id !== book.id) : [...old, { id: book.id, title: book.title, author: book.author, cover: book.cover }];
  saveWishlist(next); return next;
}
export function removeSaved(id: string): SavedBook[] { const next = loadWishlist().filter(b => b.id !== id); saveWishlist(next); return next; }
