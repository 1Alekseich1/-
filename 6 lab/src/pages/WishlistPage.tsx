import { useState } from 'react';
import { Link } from 'react-router-dom';
import { listSaved, removeSaved } from '../features/wishlist';
import { EmptyState } from '../components/EmptyState';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
export function WishlistPage() { const [books, setBooks] = useState(listSaved);
  return <section className="content-page"><h1>Мой список</h1><p><Badge>{`Сохранено: ${books.length}`}</Badge></p>
    {books.length === 0 ? <EmptyState title="Пока нет книг" description="Добавьте книгу из каталога." /> :
    <ul className="saved-list">{books.map(book => <li key={book.id}><Link to={`/books/${book.id}`}>{book.title} — {book.author}</Link>
      <Button variant="secondary" onClick={() => setBooks(removeSaved(book.id))}>Удалить</Button></li>)}</ul>}
  </section>;
}
