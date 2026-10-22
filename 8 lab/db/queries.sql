-- 1. Каталог с жанрами
SELECT b.id,b.title,a.name, string_agg(g.name, ', ' ORDER BY g.name) AS genres FROM books b JOIN authors a ON a.id=b.author_id JOIN book_genres bg ON bg.book_id=b.id JOIN genres g ON g.id=bg.genre_id GROUP BY b.id,a.name ORDER BY b.id;
-- 2. Просроченные выдачи
SELECT l.id,u.full_name,b.title,l.due_date FROM loans l JOIN users u ON u.id=l.user_id JOIN books b ON b.id=l.book_id WHERE l.return_date IS NULL AND l.due_date<CURRENT_DATE ORDER BY l.due_date;
-- 3. Топ авторов
SELECT a.name,COUNT(b.id) AS books FROM authors a LEFT JOIN books b ON b.author_id=a.id GROUP BY a.id ORDER BY books DESC;
-- 4. Читатели без выдач
SELECT u.* FROM users u LEFT JOIN loans l ON l.user_id=u.id WHERE l.id IS NULL;
-- 5. Статистика жанров
SELECT g.name,COUNT(DISTINCT bg.book_id) AS book_count FROM genres g LEFT JOIN book_genres bg ON bg.genre_id=g.id GROUP BY g.id ORDER BY book_count DESC;
-- 6. Пагинация
SELECT id,title,year FROM books ORDER BY title,id LIMIT 10 OFFSET 10;
-- 7. Доступные экземпляры
SELECT id,title,copies_available FROM books WHERE copies_available>0 ORDER BY title,id;
-- 8. Выдачи читателей
SELECT u.full_name,COUNT(l.id) AS total_loans FROM users u LEFT JOIN loans l ON l.user_id=u.id GROUP BY u.id ORDER BY total_loans DESC;
-- 9. Средний рейтинг авторов
SELECT a.name,ROUND(AVG(b.rating),2) AS average_rating FROM authors a JOIN books b ON b.author_id=a.id GROUP BY a.id;
-- 10. Активные выдачи
SELECT b.title,COUNT(l.id) AS active FROM books b LEFT JOIN loans l ON l.book_id=b.id AND l.return_date IS NULL GROUP BY b.id ORDER BY active DESC;
-- 11. Двойные жанры
SELECT b.id,b.title FROM books b JOIN book_genres bg ON bg.book_id=b.id GROUP BY b.id HAVING COUNT(*)>1 ORDER BY b.id;
-- 12. Выдачи в разрезе месяцев
SELECT DATE_TRUNC('month',loan_date) AS month,COUNT(*) FROM loans GROUP BY 1 ORDER BY 1;
