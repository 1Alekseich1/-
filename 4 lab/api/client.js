// Единственная точка сетевых запросов во всём проекте.
export const API_BASE = 'https://openlibrary.org';
export class ApiError extends Error {
  constructor(status, message) { super(message); this.name = 'ApiError'; this.status = status; }
}
export async function request(path, params = {}, signal) {
  const url = new URL(path, API_BASE);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value != null) url.searchParams.set(key, String(value));
  });
  let response;
  try { response = await fetch(url, { signal, headers: { Accept: 'application/json' } }); }
  catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError(0, 'Сеть недоступна. Проверьте подключение к интернету.');
  }
  if (!response.ok) throw new ApiError(response.status, `HTTP ${response.status}`);
  return response.json();
}
export function getErrorMessage(error) {
  if (error instanceof ApiError) {
    if (error.status === 0) return 'Нет подключения к интернету или сервер недоступен.';
    if (error.status >= 500) return 'Сервер временно недоступен (5xx). Повторите позже.';
    if (error.status === 404) return 'Книга не найдена (404).';
    if (error.status >= 400) return `Некорректный запрос или нет доступа (${error.status}).`;
  }
  return 'Не удалось получить данные. Попробуйте ещё раз.';
}
