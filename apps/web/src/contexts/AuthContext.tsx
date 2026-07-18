import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  getMe,
  login as requestLogin,
} from '../services/auth/auth.service';
import type {
  AuthUser,
  LoginInput,
} from '../services/auth/auth.types';
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '../services/auth/tokenStorage';
import { subscribeToUnauthorized } from '../services/auth/authEvents';

type AuthStatus = 'initializing' | 'anonymous' | 'authenticated';

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  sessionError: string;
  clearSessionError: () => void;
  login: (input: LoginInput, rememberMe: boolean) => Promise<AuthUser>;
  logout: (reason?: 'manual' | 'unauthorized') => void;
  refreshUser: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('initializing');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [sessionError, setSessionError] = useState('');

  const clearSessionError = useCallback(() => setSessionError(''), []);

  const logout = useCallback(
    (reason: 'manual' | 'unauthorized' = 'manual') => {
      clearAccessToken();
      setUser(null);
      setStatus('anonymous');
      setSessionError(
        reason === 'unauthorized'
          ? 'Sua sessão expirou. Entre novamente.'
          : '',
      );
    },
    [],
  );

  const refreshUser = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      setStatus('anonymous');
      return null;
    }

    try {
      const response = await getMe();
      setUser(response.data);
      setStatus('authenticated');
      setSessionError('');
      return response.data;
    } catch {
      setStatus((currentStatus) =>
        currentStatus === 'authenticated' ? currentStatus : 'anonymous',
      );
      setSessionError((currentError) =>
        getAccessToken()
          ? 'Não foi possível validar sua sessão. Tente novamente.'
          : currentError,
      );
      return null;
    }
  }, []);

  const login = useCallback(
    async (input: LoginInput, rememberMe: boolean) => {
      setSessionError('');
      const response = await requestLogin(input);
      setAccessToken(
        response.data.accessToken,
        rememberMe ? 'local' : 'session',
      );

      try {
        const currentUser = await getMe();
        setUser(currentUser.data);
        setStatus('authenticated');
        return currentUser.data;
      } catch (error) {
        clearAccessToken();
        setUser(null);
        setStatus('anonymous');
        throw error;
      }
    },
    [],
  );

  useEffect(() => {
    let isActive = true;

    const unsubscribe = subscribeToUnauthorized(() => {
      if (isActive) logout('unauthorized');
    });

    if (getAccessToken()) {
      void refreshUser();
    } else {
      setStatus('anonymous');
    }

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [logout, refreshUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      sessionError,
      clearSessionError,
      login,
      logout,
      refreshUser,
    }),
    [
      clearSessionError,
      login,
      logout,
      refreshUser,
      sessionError,
      status,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }

  return context;
}
