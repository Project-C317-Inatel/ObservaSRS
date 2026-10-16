import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';

import { getCurrentUser } from '../../services/auth';
import type { ApiUser, UserRole } from '../../types';

export interface ProtectedRouteProps {
  /** Papéis com acesso. Se vazio, basta estar logado. */
  allowedRoles?: readonly UserRole[];
}

type SessionState =
  { status: 'loading' } | { status: 'authenticated'; user: ApiUser } | { status: 'anonymous' };

/**
 * Protege as rotas filhas: consulta a sessão em GET /auth/me (cookie HttpOnly).
 * Sem sessão → manda para /login. Papel sem permissão → volta para a página inicial.
 */
export function ProtectedRoute({ allowedRoles = [] }: ProtectedRouteProps) {
  const location = useLocation();
  const [session, setSession] = useState<SessionState>({ status: 'loading' });

  useEffect(() => {
    let active = true;

    getCurrentUser()
      .then(({ usuario }) => {
        if (active) setSession({ status: 'authenticated', user: usuario });
      })
      .catch(() => {
        if (active) setSession({ status: 'anonymous' });
      });

    return () => {
      active = false;
    };
  }, []);

  if (session.status === 'loading') {
    return (
      <p className="p-8 text-center text-slate-600" role="status">
        Verificando acesso...
      </p>
    );
  }

  if (session.status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.papel)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
