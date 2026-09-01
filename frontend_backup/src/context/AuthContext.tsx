import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { tokenStore, setUnauthorizedHandler } from '../api/client';
import { login as apiLogin, register as apiRegister, getCurrentUser } from '../api/auth';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const token = tokenStore.get();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await getCurrentUser();
        setUser(me);
      } catch {
        tokenStore.clear();
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { access_token } = await apiLogin({ email, password });
    tokenStore.set(access_token);
    const me = await getCurrentUser();
    setUser(me);
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    await apiRegister({ username, email, password });
    await login(email, password);
  }, [login]);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
