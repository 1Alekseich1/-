import type { Book } from '../types';
import { Badge } from './Badge';
import { Button } from './Button';
interface BookCardProps { book: Book; saved: boolean; onToggle: (book: Book) => void; onDetails: (id: string) => void; }
export function BookCard({ book, saved, onToggle, onDetails }: BookCardProps) {
  return <article className="book-card"><figure className="book-card__figure">
      {book.cover ? <img className="book-card__image" src={book.cover} alt={`Обложка книги «${book.title}»`} width="180" height="250" loading="lazy" /> : <span className="book-card__image book-card__placeholder" aria-hidden="true">📖</span>}
    </figure><h3 className="book-card__title">{book.title}</h3><p>{book.author}</p>
    <p><Badge>{book.year === null ? 'Год не указан' : String(book.year)}</Badge> <Badge tone="positive">{book.rating === null ? 'Без рейтинга' : `★ ${book.rating.toFixed(1)}`}</Badge></p>
    <div className="book-card__controls book-card__action"><Button variant="secondary" onClick={() => onDetails(book.id)}>Подробнее</Button>
    <Button pressed={saved} onClick={() => onToggle(book)}>{saved ? '✓ В моём списке' : '♡ Хочу прочитать'}</Button></div></article>;
}
