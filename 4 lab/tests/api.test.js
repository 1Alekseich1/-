import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError, getErrorMessage } from '../api/client.js';
import { normalizeBook, PAGE_SIZE } from '../api/books.js';

test('API: page size is 20', () => assert.equal(PAGE_SIZE, 20));
test('API: convert Open Library document', () => {
  const book = normalizeBook({ key: '/works/OL45804W', title: 'Fantastic Mr Fox', author_name: ['Roald Dahl'], first_publish_year: 1970, edition_count: 55 });
  assert.deepEqual([book.id, book.title, book.author, book.year, book.editionCount], ['OL45804W', 'Fantastic Mr Fox', 'Roald Dahl', 1970, 55]);
});
test('API: invalid work key filtered', () => assert.equal(normalizeBook({ key: '/authors/OL1A' }).id, ''));
test('API: messages distinguish offline, 404 and 500', () => {
  assert.match(getErrorMessage(new ApiError(0, 'offline')), /интернету/);
  assert.match(getErrorMessage(new ApiError(404, 'not found')), /404/);
  assert.match(getErrorMessage(new ApiError(500, 'server')), /5xx/);
});
