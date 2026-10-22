import type { Book } from '../types';
import { BookCard } from './BookCard';
interface BookListProps { books: Book[]; savedIds: Set<string>; onToggle: (book: Book) => void; onDetails: (id: string) => void; }
export function BookList({ books, savedIds, onToggle, onDetails }: BookListProps) {
  return <section className="catalog__results" aria-label="Результаты поиска">{books.map(book => <BookCard key={book.id} book={book} saved={savedIds.has(book.id)} onToggle={onToggle} onDetails={onDetails} />)}</section>;
}
