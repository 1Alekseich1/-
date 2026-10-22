import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookSchema } from '../features/bookSchema';
import type { BookFormValues } from '../features/bookSchema';
import { getDraft, submitBook, FormApiError } from '../api/editor';
import { Button } from '../components/Button';
import { ErrorBox } from '../components/ErrorBox';
const defaults: BookFormValues = { title: '', author: '', isbn: '', genre: 'roman', year: 2020, copies: 1, availableCopies: 1, description: '' };
export default function BookFormPage() { const { bookId } = useParams(); const nav = useNavigate();
  const [message, setMessage] = useState(''); const [attempted, setAttempted] = useState<BookFormValues | null>(null);
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting, isDirty } } = useForm<BookFormValues>({ resolver: zodResolver(bookSchema), defaultValues: defaults });
  useEffect(() => { if (bookId) { void getDraft(bookId).then(reset).catch(() => setMessage("Не удалось загрузить книгу")); }
  }, [bookId, reset]);
  useEffect(() => { if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); }; window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);
  const submit = async (values: BookFormValues) => { setMessage(''); setAttempted(values);
    try { const id = await submitBook(values, bookId); nav(`/books/${id}`); }
    catch (error: unknown) { if (error instanceof FormApiError) {
      if (error.status === 422 || error.status === 409) {
        Object.entries(error.fields).forEach(([field, text]) => setError(field as keyof BookFormValues, { type: 'server', message: text }));
      } else setMessage(error.message);
    } else setMessage('Не удалось сохранить запись.'); }
  };
  const field = (name: keyof BookFormValues, label: string, type: 'text' | 'number' = 'text') => <p className="form-field">
    <label htmlFor={name}>{label}</label><input id={name} type={type} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined}
      {...register(name)} />{errors[name] && <small id={`${name}-error`} role="alert">{errors[name].message}</small>}
  </p>;
  return <section className="content-page"><Link to="/books">← Каталог</Link><h1>{bookId ? 'Редактировать книгу' : 'Добавить книгу'}</h1>
    <p>Данные сохраняются на сервере BookNest. Имя автора должно совпадать с автором в базе PostgreSQL.</p>
    <form className="book-form" noValidate onSubmit={handleSubmit(submit)}>
      {field('title', 'Название')}{field('author', 'Автор')}{field('isbn', 'ISBN (13 цифр)')}
      <p className="form-field"><label htmlFor="genre">Жанр</label><select id="genre" {...register('genre')}>
        <option value="roman">Роман</option><option value="klassika">Классика</option><option value="antiutopia">Антиутопия</option><option value="skazka">Сказка</option><option value="fantasy">Фэнтези</option>
      </select></p>{field('year', 'Год', 'number')}{field('copies', 'Количество экземпляров', 'number')}{field('availableCopies', 'Свободных экземпляров', 'number')}
      <p className="form-field"><label htmlFor="description">Описание</label><textarea id="description" rows={4} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? 'description-error' : undefined} {...register('description')} />
        {errors.description && <small id="description-error" role="alert">{errors.description.message}</small>}</p>
      {message && <ErrorBox message={message} onRetry={() => { if (attempted) void submit(attempted); }} />}
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Сохраняем…' : 'Сохранить книгу'}</Button>
    </form></section>;
}
