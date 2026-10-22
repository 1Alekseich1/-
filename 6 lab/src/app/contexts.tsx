import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
interface AuthState { signedIn: boolean; login: () => void; logout: () => void; }
interface ThemeState { theme: 'light' | 'dark'; toggle: () => void; }
const AuthContext = createContext<AuthState | null>(null);
const ThemeContext = createContext<ThemeState | null>(null);
export function Providers({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState(() => sessionStorage.getItem('booknest-demo-user') === 'yes');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => localStorage.getItem('booknest-theme') === 'dark' ? 'dark' : 'light');
  useEffect(() => { sessionStorage.setItem('booknest-demo-user', signedIn ? 'yes' : 'no'); }, [signedIn]);
  useEffect(() => { localStorage.setItem('booknest-theme', theme); document.documentElement.dataset.theme = theme; }, [theme]);
  return <AuthContext.Provider value={{ signedIn, login: () => setSignedIn(true), logout: () => setSignedIn(false) }}>
    <ThemeContext.Provider value={{ theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') }}>{children}</ThemeContext.Provider>
  </AuthContext.Provider>;
}
export function useAuth(): AuthState { const auth = useContext(AuthContext); if (!auth) throw new Error('AuthProvider отсутствует'); return auth; }
export function useTheme(): ThemeState { const theme = useContext(ThemeContext); if (!theme) throw new Error('ThemeProvider отсутствует'); return theme; }
