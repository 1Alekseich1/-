import type { PageMode } from '../types';
import { Badge } from './Badge';
interface HeaderProps { mode: PageMode; count: number; onNavigate: (mode: PageMode) => void; }
export function Header({ mode, count, onNavigate }: HeaderProps) {
  return <header className="site-header"><a className="site-header__brand" href="/">📚 BookNest</a>
    <nav className="site-header__nav" aria-label="Основная навигация"><ul className="site-header__links">
      <li><button className="nav-button" aria-current={mode === 'catalog' ? 'page' : undefined} onClick={() => onNavigate('catalog')}>Каталог</button></li>
      <li><button className="nav-button" aria-current={mode === 'wishlist' ? 'page' : undefined} onClick={() => onNavigate('wishlist')}>Мой список <Badge tone="positive">{String(count)}</Badge></button></li>
    </ul></nav></header>;
}
