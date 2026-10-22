import type { SavedBook } from '../types';
import { Badge } from './Badge';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
interface WishlistProps { books: SavedBook[]; onRemove: (book: SavedBook) => void; onDetails: (id: string) => void; onCatalog: () => void; }
export function Wishlist({ books, onRemove, onDetails, onCatalog }: WishlistProps) {
  return <section className="wishlist-section"><h1>Мой список <Badge tone="positive">{String(books.length)}</Badge></h1>
    {books.length === 0 ? <EmptyState title="Список пока пуст" description="Найдите книгу и нажмите «Хочу прочитать»." onReset={onCatalog} /> :
    <ul className="wishlist-list">{books.map(book => <li key={book.id} className="wish-item"><span><strong>{book.title}</strong> — {book.author}</span>
      <span className="book-card__controls"><Button variant="secondary" onClick={() => onDetails(book.id)}>Открыть</Button><Button onClick={() => onRemove(book)}>Удалить</Button></span></li>)}</ul>}</section>;
}
