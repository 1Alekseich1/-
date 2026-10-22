export type SortMode = 'relevance' | 'title' | 'year' | 'rating';
export type Genre = '' | 'roman' | 'klassika' | 'antiutopia' | 'skazka' | 'fantasy';
export type PageMode = 'catalog' | 'wishlist';
export type LoadStatus = 'loading' | 'success' | 'empty' | 'error';
export interface Book { id: string; title: string; author: string; year: number | null; cover: string; rating: number | null; editionCount: number; }
export interface BookDetails { id: string; title: string; description: string; cover: string; year: string; editionCount: number; subjects: string[]; }
export interface Filters { q: string; genre: Genre; sort: SortMode; availableOnly: boolean; }
export interface SearchResult { books: Book[]; total: number; }
export interface SavedBook { id: string; title: string; author: string; cover: string; }
