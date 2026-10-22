import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { clearTokens, currentUser, loginUser, registerUser, saveTokens, storedAccess } from '../api/auth';
import type { UserInfo } from '../api/auth';
interface AuthState { signedIn: boolean; user: UserInfo | null; login: (email: string, password: string) => Promise<void>; register: (name: string,email: string,password: string) => Promise<void>; logout: () => void; }
interface ThemeState { theme: 'light' | 'dark'; toggle: () => void; }
const AuthContext = createContext<AuthState | null>(null);
const ThemeContext = createContext<ThemeState | null>(null);
export function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => localStorage.getItem('booknest-theme') === 'dark' ? 'dark' : 'light');
  useEffect(() => { let active = true; if (storedAccess()) void currentUser().then(u => {if(active)setUser(u);}).catch(()=> {if(active)setUser(null);});
    const onLogout = () => setUser(null); window.addEventListener('booknest:logout', onLogout); return () => { active = false; window.removeEventListener('booknest:logout', onLogout); }; }, []);
  useEffect(() => { localStorage.setItem('booknest-theme', theme); document.documentElement.dataset.theme = theme; }, [theme]);
  const login = async (email: string, password: string): Promise<void> => { saveTokens(await loginUser(email,password)); setUser(await currentUser()); };
  const register = async (name: string, email: string,password: string): Promise<void> => { await registerUser(name,email,password); await login(email,password); };
  const logout = (): void => { clearTokens(); setUser(null); };
  return <AuthContext.Provider value={{signedIn:user!==null, user, login, register, logout}}>
    <ThemeContext.Provider value={{theme, toggle:()=>setTheme(t=> t==='dark'?'light':'dark')}}>{children}</ThemeContext.Provider>
  </AuthContext.Provider>;
}
export function useAuth(): AuthState { const auth=useContext(AuthContext); if(!auth) throw new Error('Нет AuthProvider'); return auth; }
export function useTheme(): ThemeState { const theme=useContext(ThemeContext); if(!theme) throw new Error('Нет ThemeProvider'); return theme; }
