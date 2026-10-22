import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { Providers, useAuth, useTheme } from './contexts';
import { CatalogPage } from '../pages/CatalogPage';
import { DetailPage } from '../pages/DetailPage';
import { WishlistPage } from '../pages/WishlistPage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { LoansPage } from '../pages/LoansPage';
import { Spinner } from '../components/Spinner';
import { NavLink } from 'react-router-dom';
const BookFormPage = lazy(() => import('../pages/BookFormPage'));
function Layout() {
  const { signedIn, logout, user } = useAuth(); const { theme, toggle } = useTheme();
  return <><header className="site-header"><nav className="site-header__inner" aria-label="Основная навигация">
    <NavLink className="site-header__brand" to="/books">📚 BookNest</NavLink>
    <NavLink to="/books">Каталог</NavLink><NavLink to="/wishlist">Мой список</NavLink>{signedIn&&<NavLink to="/loans">Мои выдачи</NavLink>}
    {user?.role === "librarian" && <NavLink to="/books/new">Добавить книгу</NavLink>}
    <button type="button" onClick={toggle} aria-label="Сменить тему">{theme === 'dark' ? '☀️ Светлая' : '🌙 Тёмная'}</button>
    {signedIn ? <button type="button" onClick={logout}>Выйти ({user?.role})</button> : <NavLink to="/login">Войти</NavLink>}
  </nav></header><main className="page-main page-main--react"><Outlet /></main>
    <footer className="site-footer"><p>BookNest — учебный книжный клуб университета · ЛР №10</p></footer></>;
}
function RequireAuth() { const auth = useAuth(); const location = useLocation();
  return auth.signedIn ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
function RequireLibrarian() { const {user}=useAuth(); return user?.role === "librarian" ? <Outlet/> : <Navigate to="/login" replace/>; }
function AppRoutes() { return <Routes><Route element={<Layout />}>
  <Route index element={<Navigate to="/books" replace />} /><Route path="books" element={<CatalogPage />} />
  <Route element={<RequireLibrarian/>}><Route path="books/new" element={<Suspense fallback={<Spinner />}><BookFormPage /></Suspense>} />
  <Route path="books/:bookId/edit" element={<Suspense fallback={<Spinner />}><BookFormPage /></Suspense>} />
  </Route><Route path="books/:bookId" element={<DetailPage />} />
  <Route element={<RequireAuth />}><Route path="wishlist" element={<WishlistPage />} /><Route path="loans" element={<LoansPage />} /></Route>
  <Route path="login" element={<LoginPage />} /><Route path="*" element={<NotFoundPage />} />
 </Route></Routes>; }
export default function App() { return <Providers><AppRoutes /></Providers>; }
