import { ApiError } from './client';
import type { BookFormValues } from '../features/bookSchema';
export class FormApiError extends ApiError {
  constructor(status: number, message: string, public readonly fields: Partial<Record<keyof BookFormValues, string>> = {}) { super(status, message); }
}
type DraftBook = BookFormValues & { id: string };
const KEY = 'booknest-lab6-drafts';
function read(): DraftBook[] { try { const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]'); return Array.isArray(value) ? value as DraftBook[] : []; } catch { return []; } }
export function getDraft(id: string): DraftBook | undefined { return read().find(book => book.id === id); }
export async function submitBook(values: BookFormValues, id?: string): Promise<string> {
  // Симуляция сетевого API. В ЛР 7–10 метод будет заменён реальным POST/PATCH FastAPI.
  await new Promise<void>(resolve => window.setTimeout(resolve, 350));
  if (values.title.toLowerCase() === 'ошибка 422') throw new FormApiError(422, 'Ошибка валидации сервера', { title: 'Сервер отклонил название' });
  if (values.title.toLowerCase() === 'ошибка 500') throw new FormApiError(500, 'Внутренняя ошибка учебного API');
  const previous = read();
  if (previous.some(book => book.isbn === values.isbn && book.id !== id)) throw new FormApiError(409, 'ISBN уже занят', { isbn: 'Книга с таким ISBN уже существует' });
  const nextId = id?.startsWith('local-') ? id : `local-${Date.now()}`;
  localStorage.setItem(KEY, JSON.stringify([...previous.filter(b => b.id !== nextId), { ...values, id: nextId }]));
  return nextId;
}
