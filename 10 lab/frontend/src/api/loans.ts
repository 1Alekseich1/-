import { authorizedRequest } from './auth';
import { readError } from './client';
export interface Loan {id:number;user_id:number;book_id:number;loan_date:string;due_date:string;return_date:string|null}
async function read<T>(path:string,init?:RequestInit):Promise<T>{const res=await authorizedRequest(path,init);if(!res.ok)throw await readError(res);return res.json() as Promise<T>;}
export function mine():Promise<Loan[]>{return read('/api/v1/loans/mine');}
export function createLoan(book_id:number,user_id:number):Promise<Loan>{return read('/api/v1/loans',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({book_id,user_id,days:14})});}
export function returnLoan(id:number):Promise<Loan>{return read(`/api/v1/loans/${id}`,{method:'PATCH'});}
