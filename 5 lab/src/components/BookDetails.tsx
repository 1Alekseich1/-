import type { BookDetails as Details } from '../types';
import { Badge } from './Badge';
import { Button } from './Button';
interface BookDetailsProps { book: Details; onBack: () => void; }
export function BookDetails({ book, onBack }: BookDetailsProps) {
  return <article className="book-detail"><Button variant="secondary" onClick={onBack}>← Вернуться в каталог</Button><h1>{book.title}</h1>
    {book.cover && <figure className="book-detail__cover"><img src={book.cover} alt={`Обложка «${book.title}»`} width="240" height="320" /></figure>}
    <dl className="spec-list"><dt>Первое издание</dt><dd>{book.year}</dd><dt>Количество изданий</dt><dd>{book.editionCount}</dd></dl>
    <h2>Описание</h2><p className="details-description">{book.description}</p><h2>Темы</h2><p>{book.subjects.length ? book.subjects.map(subject => <Badge key={subject}>{subject}</Badge>) : 'Не указаны'}</p></article>;
}
