import type { Filters, Genre, SortMode } from '../types';
import { Button } from './Button';
interface FiltersPanelProps { filters: Filters; onChange: (filters: Filters) => void; onReset: () => void; }
export function FiltersPanel({ filters, onChange, onReset }: FiltersPanelProps) {
  return <aside className="filters"><h2>Найти книгу</h2><form className="filters__form" onSubmit={event => event.preventDefault()}>
    <p><label htmlFor="search">Название или автор</label><input id="search" name="search" type="search" value={filters.q} onChange={event => onChange({ ...filters, q: event.target.value })} placeholder="Например, Толстой" /></p>
    <p><label htmlFor="genre">Жанр</label><select id="genre" name="genre" value={filters.genre} onChange={event => onChange({ ...filters, genre: event.target.value as Genre })}>
      <option value="">Все жанры</option><option value="roman">Романы</option><option value="klassika">Классика</option><option value="antiutopia">Антиутопии</option><option value="skazka">Сказки</option><option value="fantasy">Фэнтези</option></select></p>
    <p><label htmlFor="sort">Сортировка</label><select id="sort" name="sort" value={filters.sort} onChange={event => onChange({ ...filters, sort: event.target.value as SortMode })}>
      <option value="relevance">По релевантности</option><option value="title">По названию (А–Я)</option><option value="year">По году (новые)</option><option value="rating">По рейтингу</option></select></p>
    <p><input type="checkbox" id="available" name="available" disabled checked={filters.availableOnly} onChange={event => onChange({ ...filters, availableOnly: event.target.checked })} /><label htmlFor="available">Только доступные</label></p>
    <small className="helper-text">Open Library не содержит данных о наличии экземпляров клуба. Сортировки по названию и рейтингу работают внутри текущей страницы.</small>
    <Button variant="secondary" onClick={onReset}>Сбросить фильтры</Button></form></aside>;
}
