import { useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';
import type { AuthUser } from '../services/authService';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // On mount — try to restore session from saved token
  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }

    authService
      .fetchMe()
      .then((user) => setState({ user, isAuthenticated: true, isLoading: false, error: null }))
      .catch(() => {
        authService.deleteToken();
        setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const { user } = await authService.login(email, password);
      setState({ user, isAuthenticated: true, isLoading: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setState((s) => ({ ...s, isLoading: false, error: msg }));
      throw err;
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const { user } = await authService.register(username, email, password);
      setState({ user, isAuthenticated: true, isLoading: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setState((s) => ({ ...s, isLoading: false, error: msg }));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setState({ user: null, isAuthenticated: false, isLoading: false, error: null });
  }, []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    clearError,
  };
}
