# Проверка безопасности BookNest — ЛР 9

Проверочные пункты (файлы и функции вместо нестабильных номеров строк):

1. Пароли хешируются bcrypt — `app/core/security.py:hash_password`.
2. Пароли проверяются bcrypt — `app/core/security.py:verify_password`.
3. Сервер не выдаёт хеши — `app/schemas/auth.py:UserRead`.
4. Повтор e-mail даёт 409 — `app/routers/auth.py:register`.
5. Одинаковая ошибка для неправильной почты/пароля — `app/routers/auth.py:login`.
6. Access JWT действует 20 минут — `app/core/security.py:create_token`.
7. Refresh JWT действует 7 дней — `app/core/security.py:create_token`.
8. Payload содержит только `sub`, `role`, `iat`, `exp`, `type` — `create_token`.
9. Refresh не принимается как access — `parse_token`.
10. Секрет обязателен из окружения — `app/config.py:Settings`.
11. Гость получает 401 на защищённых маршрутах — `app/core/auth.py:get_current_user`.
12. Member получает 403 при изменении каталога — `app/core/auth.py:require_role`.
13. Чужая выдача скрыта ответом 404 — `app/core/auth.py:check_loan_owner`.
14. CORS имеет белый список — `app/main.py`.
15. В клиенте заголовок добавляется в одном месте — `frontend/src/api/auth.ts:authorizedRequest`.

Проверка была проведена по коду. Перед сдачей необходимо отдельно проверить 401/403/404 и CORS на запущенной PostgreSQL, а также историю Git на секреты.

Замечание: токены в sessionStorage доступны JavaScript при XSS, поэтому это учебный компромисс. В промышленном проекте потребуются HttpOnly cookies, защита от CSRF, отзыв refresh-токенов и rate limiting.
