import { z } from 'zod';
export const bookSchema = z.object({
  title: z.string().trim().min(2, 'Укажите название от 2 символов').max(100),
  author: z.string().trim().min(2, 'Укажите автора от 2 символов'),
  isbn: z.string().regex(/^[0-9]{13}$/, 'ISBN должен состоять из 13 цифр'),
  genre: z.enum(['roman', 'klassika', 'antiutopia', 'skazka', 'fantasy']),
  year: z.coerce.number<number>().int().min(1450, 'Год не может быть меньше 1450').max(2100),
  copies: z.coerce.number<number>().int().min(1, 'Нужно минимум 1 экземпляр').max(100),
  availableCopies: z.coerce.number<number>().int().min(0, 'Число не может быть отрицательным'),
  description: z.string().trim().min(10, 'Описание должно содержать минимум 10 символов'),
}).refine(x => x.availableCopies <= x.copies, { path: ['availableCopies'], message: 'Свободных экземпляров не может быть больше общего количества' });
export type BookFormValues = z.infer<typeof bookSchema>;
