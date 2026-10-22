export const API_BASE = 'https://openlibrary.org';
export class ApiError extends Error {
  constructor(public readonly status: number, message: string) { super(message); this.name = 'ApiError'; }
}
export async function request<T>(path: string, params: Record<string, string | number | undefined> = {}, signal?: AbortSignal): Promise<T> {
  const url = new URL(path, API_BASE);
  Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== '') url.searchParams.set(key, String(value)); });
  let response: Response;
  try { response = await fetch(url, { signal, headers: { Accept: 'application/json' } }); }
  catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') throw error;
    throw new ApiError(0, 'Нет подключения к сети');
  }
  if (!response.ok) throw new ApiError(response.status, `HTTP ${response.status}`);
  return response.json() as Promise<T>;
}
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return 'Нет сети или сервер недоступен. Проверьте интернет.';
    if (error.status === 404) return 'Книга не найдена (404).';
    if (error.status >= 500) return 'Ошибка сервера (5xx). Попробуйте позже.';
    if (error.status >= 400) return `Ошибка запроса (${error.status}).`;
  }
  return 'Не удалось загрузить данные. Повторите попытку.';
}
