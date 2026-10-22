-- Run after migrations: psql -d booknest -f db/seed.sql
INSERT INTO authors (id,name,country,birth_year) VALUES
(1,'Михаил Булгаков','Россия',1891),(2,'Джордж Оруэлл','Великобритания',1903),
(3,'Рэй Брэдбери','США',1920),(4,'Агата Кристи','Великобритания',1890),
(5,'Жюль Верн','Франция',1828);
INSERT INTO genres (id,name) VALUES (1,'Классика'),(2,'Фантастика'),(3,'Детектив'),(4,'Научная'),(5,'Приключения');
INSERT INTO books (id,title,author_id,isbn,year,rating,copies_total,copies_available,description)
SELECT n, 'Книга '|| n, ((n-1)%5)+1,
       '978'||LPAD(n::text,10,'0'), 1950+n, (3.5 + (n%15)*0.1)::numeric(3,2),
       3, CASE WHEN n%6=0 THEN 0 ELSE 2 END, 'Учебное описание книги '||n
FROM generate_series(1,30) n;
INSERT INTO book_genres (book_id, genre_id)
SELECT id, ((id-1)%5)+1 FROM books;
INSERT INTO book_genres (book_id, genre_id)
SELECT id, (id%5)+1 FROM books WHERE id%3=0;
INSERT INTO users (id,email,full_name)
SELECT n, 'reader'||n||'@example.org', 'Читатель '||n FROM generate_series(1,10) n;
INSERT INTO profiles (user_id,faculty,phone)
SELECT id,'Информационные технологии',NULL FROM users;
INSERT INTO loans (id,user_id,book_id,loan_date,due_date,return_date)
SELECT n, ((n-1)%8)+1, n,
       CURRENT_DATE-60, CURRENT_DATE-46,
       CASE WHEN n<=10 THEN CURRENT_DATE-40 ELSE NULL END
FROM generate_series(1,20) n;
SELECT setval(pg_get_serial_sequence('authors','id'), (SELECT MAX(id) FROM authors));
SELECT setval(pg_get_serial_sequence('books','id'), (SELECT MAX(id) FROM books));
SELECT setval(pg_get_serial_sequence('genres','id'), (SELECT MAX(id) FROM genres));
SELECT setval(pg_get_serial_sequence('users','id'), (SELECT MAX(id) FROM users));
SELECT setval(pg_get_serial_sequence('loans','id'), (SELECT MAX(id) FROM loans));
