import { Button } from './Button';
interface PaginationProps { page: number; total: number; pageSize: number; onChange: (page: number) => void; }
export function Pagination({ page, total, pageSize, onChange }: PaginationProps) {
  const last = Math.max(1, Math.ceil(total / pageSize));
  return <nav className="pagination" aria-label="Страницы каталога"><Button variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>← Назад</Button>
    <span>Страница {page} из {last}</span><Button variant="secondary" disabled={page >= last} onClick={() => onChange(page + 1)}>Вперёд →</Button></nav>;
}
