export interface UserInfo { id: number; email: string; full_name: string; role: 'member' | 'librarian' }
export interface Tokens { access_token: string; refresh_token: string; token_type: 'bearer' }
const ACCESS = 'booknest-access';
const REFRESH = 'booknest-refresh';
export const storedAccess = (): string | null => sessionStorage.getItem(ACCESS);
export const saveTokens = (tokens: Tokens): void => { sessionStorage.setItem(ACCESS, tokens.access_token); sessionStorage.setItem(REFRESH, tokens.refresh_token); };
export const clearTokens = (): void => { sessionStorage.removeItem(ACCESS); sessionStorage.removeItem(REFRESH); };
export async function loginUser(email: string, password: string): Promise<Tokens> {
  const form = new URLSearchParams({username: email, password});
  const response = await fetch('/auth/token', { method: 'POST', body: form });
  if (!response.ok) throw new Error('Неверный логин или пароль');
  return response.json() as Promise<Tokens>;
}
export async function registerUser(full_name: string, email: string, password: string): Promise<UserInfo> {
  const response = await fetch('/auth/register', {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({full_name,email,password})});
  if (!response.ok) throw new Error(response.status === 409 ? 'Email уже занят' : 'Ошибка регистрации');
  return response.json() as Promise<UserInfo>;
}
export async function currentUser(): Promise<UserInfo> {
  const response = await authorizedRequest('/auth/me');
  if (!response.ok) throw new Error('Не удалось загрузить пользователя');
  return response.json() as Promise<UserInfo>;
}
export async function authorizedRequest(path: string, init: RequestInit = {}): Promise<Response> {
  const access = storedAccess();
  const headers = new Headers(init.headers);
  if (access) headers.set('Authorization', `Bearer ${access}`);
  let response = await fetch(path, {...init, headers});
  if (response.status === 401 && sessionStorage.getItem(REFRESH)) {
    const refresh = await fetch('/auth/refresh', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({refresh_token:sessionStorage.getItem(REFRESH)})}).catch(() => null);
    if (refresh?.ok) {
      saveTokens(await refresh.json() as Tokens);
      headers.set('Authorization', `Bearer ${storedAccess()}`);
      response = await fetch(path, {...init, headers});
    }
  }
  if (response.status === 401) { clearTokens(); window.dispatchEvent(new Event('booknest:logout')); if(window.location.pathname!=='/login'){sessionStorage.setItem('booknest-intended',window.location.pathname+window.location.search);window.location.assign('/login');} }
  return response;
}
