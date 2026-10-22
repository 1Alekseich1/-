import type { Book, SavedBook } from '../types';
export function toSavedBook(book: Book): SavedBook {
  return { id: book.id, title: book.title, author: book.author, cover: book.cover };
}
export function toggleWishlist(list: SavedBook[], book: SavedBook): SavedBook[] {
  return list.some(item => item.id === book.id) ? list.filter(item => item.id !== book.id) : [...list, book];
}
