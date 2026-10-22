import { ApiError, readError } from './client';
import { authorizedRequest } from './auth';
import type { BookFormValues } from '../features/bookSchema';
export class FormApiError extends ApiError {
  constructor(status: number, message: string, public readonly fields: Partial<Record<keyof BookFormValues, string>> = {}) {super(status,message);}
}
interface Author { id: number; name: string }
interface AuthorPage { items: Author[] }
interface SavedBook { id:number; title:string; isbn:string; author_id:number; genre:string; year:number; copies_total:number; copies_available:number; description:string }
const genres: Record<BookFormValues['genre'],string> = { roman:'Классика', klassika:'Классика', antiutopia:'Фантастика', skazka:'Приключения', fantasy:'Фантастика' };
function toForm(book: SavedBook, author: string): BookFormValues {
  const genre: BookFormValues['genre'] = book.genre === 'Фантастика' ? 'fantasy' : book.genre === 'Приключения' ? 'skazka' : 'klassika';
  return {title:book.title, author, isbn:book.isbn, genre, year:book.year, copies:book.copies_total,
    availableCopies:book.copies_available, description:book.description};
}
async function getAuthors(): Promise<Author[]> {
  const res = await authorizedRequest('/api/v1/authors?size=100');
  if(!res.ok) throw new FormApiError(res.status,'Не удалось получить авторов');
  return ((await res.json()) as AuthorPage).items;
}
export async function getDraft(id: string): Promise<BookFormValues> {
  const res = await authorizedRequest(`/api/v1/books/${encodeURIComponent(id)}`);
  if(!res.ok) throw new FormApiError(res.status,'Книга не найдена');
  const book = await res.json() as SavedBook;
  const authors = await getAuthors();
  return toForm(book,authors.find(a=>a.id===book.author_id)?.name ?? 'Неизвестный автор');
}
export async function submitBook(values: BookFormValues, id?:string): Promise<string> {
  const authors=await getAuthors();
  const author=authors.find(a=>a.name.toLocaleLowerCase('ru')===values.author.trim().toLocaleLowerCase('ru'));
  if(!author) throw new FormApiError(422,'Автор не найден',{author:'Сначала добавьте автора через Swagger API'});
  const payload = {title:values.title,author_id:author.id,isbn:values.isbn,genre:genres[values.genre],
    year:values.year,rating:0,copies_total:values.copies,copies_available:values.availableCopies,description:values.description};
  const res = await authorizedRequest(id?`/api/v1/books/${encodeURIComponent(id)}`:'/api/v1/books',{
    method:id?'PATCH':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  if(!res.ok){
    if(res.status===409) throw new FormApiError(409,'ISBN уже занят',{isbn:'ISBN уже используется'});
    if(res.status===422){const problem=await readError(res); const mapped:Partial<Record<keyof BookFormValues,string>>={};
      const keys:Record<string,keyof BookFormValues>={title:'title',author_id:'author',isbn:'isbn',year:'year',genre:'genre',copies_total:'copies',copies_available:'availableCopies',description:'description'};
      if(Array.isArray(problem.problem?.details)) for(const item of problem.problem.details){const field=keys[item.field.split('.').at(-1)??''];if(field)mapped[field]=item.message;}
      throw new FormApiError(422,problem.message,mapped);}
    throw new FormApiError(res.status,'Не удалось сохранить книгу');
  }
  const book=await res.json() as {id:number};
  return String(book.id);
}
