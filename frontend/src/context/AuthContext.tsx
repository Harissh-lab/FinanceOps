import { createContext, useContext, useMemo, useState } from 'react';
import { login as loginApi, logout as logoutApi } from '../api/auth';
import { setAccessToken } from '../api/tokenStore';
import type { Role, User } from '../types';

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (...roles: Role[]) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      login: async (email: string, password: string) => {
        const response = await loginApi({ email, password });
        setUser(response.user);
        setAccessTokenState(response.accessToken);
        setAccessToken(response.accessToken);
      },
      logout: async () => {
        await logoutApi();
        setUser(null);
        setAccessTokenState(null);
        setAccessToken(null);
      },
      hasRole: (...roles: Role[]) => Boolean(user && roles.includes(user.role)),
    }),
    [accessToken, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
