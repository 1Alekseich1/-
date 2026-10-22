export interface Problem { code: string; message: string; details: Array<{field:string;message:string}> | Record<string,string>; request_id: string }
export class ApiError extends Error {
  constructor(public readonly status:number, message:string, public readonly problem?:Problem) {super(message); this.name='ApiError';}
}
export async function readError(response: Response): Promise<ApiError> {
  const data: unknown = await response.json().catch(() => null);
  if(data && typeof data==='object' && 'message' in data && typeof data.message==='string')
    return new ApiError(response.status,data.message,data as Problem);
  return new ApiError(response.status, `Ошибка сервера (${response.status})`);
}
export async function request<T>(path:string, params:Record<string,string|number|boolean|undefined>={}, signal?:AbortSignal):Promise<T> {
  const query=new URLSearchParams();
  Object.entries(params).forEach(([key,value])=> {if(value!==undefined && value!=='')query.set(key,String(value));});
  const url=path+(query.size?'?'+query.toString():'');
  let response:Response;
  try {response=await fetch(url,{signal,headers:{Accept:'application/json'}});}
  catch(error:unknown){if(error instanceof Error && error.name==='AbortError')throw error; throw new ApiError(0,'Нет соединения с сервером');}
  if(!response.ok)throw await readError(response);
  return response.json() as Promise<T>;
}
export function errorMessage(error:unknown):string {return error instanceof Error?error.message:'Не удалось выполнить запрос';}
