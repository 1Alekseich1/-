CREATE TABLE authors (
	id SERIAL NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	country VARCHAR(80) NOT NULL, 
	birth_year INTEGER NOT NULL, 
	PRIMARY KEY (id), 
	CHECK (birth_year BETWEEN 1000 AND 2026)
);

CREATE TABLE genres (
	id SERIAL NOT NULL, 
	name VARCHAR(50) NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (name)
);

CREATE TABLE users (
	id SERIAL NOT NULL, 
	email VARCHAR(255) NOT NULL, 
	full_name VARCHAR(100) NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (email)
);

CREATE TABLE books (
	id SERIAL NOT NULL, 
	title VARCHAR(150) NOT NULL, 
	author_id INTEGER NOT NULL, 
	isbn VARCHAR(13) NOT NULL, 
	year INTEGER NOT NULL, 
	rating NUMERIC(3, 2) NOT NULL, 
	copies_total INTEGER NOT NULL, 
	copies_available INTEGER NOT NULL, 
	description TEXT NOT NULL, 
	PRIMARY KEY (id), 
	CHECK (year BETWEEN 1450 AND 2026), 
	CHECK (rating BETWEEN 0 AND 5), 
	CHECK (copies_total >= 0), 
	CHECK (copies_available BETWEEN 0 AND copies_total), 
	FOREIGN KEY(author_id) REFERENCES authors (id) ON DELETE RESTRICT, 
	UNIQUE (isbn)
);

CREATE TABLE profiles (
	user_id INTEGER NOT NULL, 
	faculty VARCHAR(100) NOT NULL, 
	phone VARCHAR(30), 
	PRIMARY KEY (user_id), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE book_genres (
	book_id INTEGER NOT NULL, 
	genre_id INTEGER NOT NULL, 
	PRIMARY KEY (book_id, genre_id), 
	FOREIGN KEY(book_id) REFERENCES books (id) ON DELETE CASCADE, 
	FOREIGN KEY(genre_id) REFERENCES genres (id) ON DELETE RESTRICT
);

CREATE TABLE loans (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	book_id INTEGER NOT NULL, 
	loan_date DATE NOT NULL, 
	due_date DATE NOT NULL, 
	return_date DATE, 
	PRIMARY KEY (id), 
	CHECK (due_date >= loan_date), 
	CHECK (return_date IS NULL OR return_date >= loan_date), 
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE RESTRICT, 
	FOREIGN KEY(book_id) REFERENCES books (id) ON DELETE RESTRICT
);
