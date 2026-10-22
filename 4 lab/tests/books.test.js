import test from 'node:test';
import assert from 'node:assert/strict';
import { books } from '../data/books.js';
import { filterBooks, sortBooks } from '../lib/books.js';

test('40 книг и пять жанров', () => { assert.equal(books.length, 40); assert.equal(new Set(books.map((b) => b.genre)).size, 5); });
test('поиск по автору без учёта регистра', () => {
  const found = filterBooks(books, {q: 'ТОЛСТОЙ', genre:'', availableOnly:false});
  assert.ok(found.length >= 2); assert.ok(found.every((b) => b.author.includes('Толстой')));
});
test('жанр и наличие работают одновременно', () => {
  const found = filterBooks(books, {q:'', genre:'antiutopia', availableOnly:true});
  assert.ok(found.every((b) => b.genre === 'antiutopia' && b.available > 0));
});
test('сортировка не меняет оригинал', () => {
  const input = [books[1], books[0]]; const copy = [...input];
  const result = sortBooks(input, 'rating');
  assert.deepEqual(input, copy); assert.notEqual(result, input);
});
test('сортировка по году: новые сначала', () => {
  const result = sortBooks(books, 'year');
  assert.ok(result.every((b, index) => !index || result[index - 1].year >= b.year));
});
