-- Requires a populated database. Indexes must be dropped ONLY in a disposable test database.
DROP INDEX IF EXISTS ix_books_author_year;
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM books WHERE author_id=1 ORDER BY year;
CREATE INDEX ix_books_author_year ON books (author_id,year);
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM books WHERE author_id=1 ORDER BY year;
DROP INDEX IF EXISTS ix_loans_due_return;
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM loans WHERE return_date IS NULL AND due_date<CURRENT_DATE;
CREATE INDEX ix_loans_due_return ON loans (due_date,return_date);
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM loans WHERE return_date IS NULL AND due_date<CURRENT_DATE;
-- With only 30 books PostgreSQL may prefer Seq Scan. Real plans must be captured locally.
