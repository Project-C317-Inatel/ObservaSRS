import { useCallback, useEffect, useState } from 'react';

import { getCurrentUser, logout as logoutRequest } from '../services/auth';
import type { ApiUser } from '../types';
import { ApiRequestError } from '../services/api';

export type AdminSessionStatus =
  'checking' | 'authenticated' | 'unauthenticated' | 'forbidden' | 'error';

export function useAdminSession() {
  const [status, setStatus] = useState<AdminSessionStatus>('checking');
  const [user, setUser] = useState<ApiUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkSession = useCallback(async () => {
    setStatus('checking');
    setError(null);

    try {
      const response = await getCurrentUser();
      setUser(response.usuario);
      setStatus(response.usuario.papel === 'SUPER_ADMIN' ? 'authenticated' : 'forbidden');
    } catch (requestError: unknown) {
      setUser(null);
      if (requestError instanceof ApiRequestError && requestError.status === 403) {
        setStatus('forbidden');
        setError(requestError.message);
      } else if (requestError instanceof ApiRequestError && requestError.status === 401) {
        setStatus('unauthenticated');
        setError(requestError.message);
      } else {
        setStatus('error');
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Não foi possível validar sua sessão.',
        );
      }
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void checkSession());
  }, [checkSession]);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  return { status, user, error, checkSession, logout };
}
