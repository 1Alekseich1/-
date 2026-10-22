CREATE INDEX ix_books_author_year ON books (author_id, year);
CREATE INDEX ix_loans_due_return ON loans (due_date, return_date);
