import { request } from './client';
import type { Book, BookDetails, Filters, SearchResult } from '../types';
export const PAGE_SIZE=20;
export interface ApiBook {id:number;title:string;author_id:number;isbn:string;year:number;genre:string;rating:number;copies_total:number;copies_available:number;description:string;available:boolean}
interface Page<T> {items:T[];total:number;page:number;size:number}
interface Author {id:number;name:string}
const genres:Record<Exclude<Filters['genre'],''>,string>={roman:'Классика',klassika:'Классика',antiutopia:'Фантастика',skazka:'Приключения',fantasy:'Фантастика'};
export async function searchBooks(filters:Filters,page:number,signal?:AbortSignal):Promise<SearchResult> {
  const options={q:filters.q,genre:filters.genre?genres[filters.genre]:undefined,available_only:filters.availableOnly,page,size:PAGE_SIZE,sort:filters.sort==='year'?'-year':filters.sort==='rating'?'-rating':'title'};
  const [results,authors]=await Promise.all([request<Page<ApiBook>>('/api/v1/books',options,signal),request<Page<Author>>('/api/v1/authors',{page:1,size:100},signal)]);
  const names=new Map(authors.items.map(a=>[a.id,a.name]));
  const books:Book[]=results.items.map(item=>({id:String(item.id),title:item.title,author:names.get(item.author_id)??'Автор неизвестен',year:item.year,cover:'',rating:item.rating,editionCount:item.copies_available}));
  return {books,total:results.total};
}
export async function getBook(id:string,signal?:AbortSignal):Promise<BookDetails> {
  const book=await request<ApiBook>(`/api/v1/books/${encodeURIComponent(id)}`,{},signal);
  return {id:String(book.id),title:book.title,description:book.description,cover:'',year:String(book.year),editionCount:book.copies_available,subjects:[book.genre]};
}
