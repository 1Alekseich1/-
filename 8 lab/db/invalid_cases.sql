-- Run each independently: errors are expected. Roll back any failed transaction.
INSERT INTO books(title,author_id,isbn,year,rating,copies_total,copies_available,description) VALUES('Ошибка',1,'9999999999999',2001,4,1,5,''); -- CHECK
INSERT INTO books(title,author_id,isbn,year,rating,copies_total,copies_available,description) VALUES('Ошибка',9999,'9999999999998',2001,4,2,2,''); -- FK
INSERT INTO genres(id,name) VALUES(999,'Классика'); -- UNIQUE
