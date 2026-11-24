import { useState } from 'react';
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router';

import { useAdminSession } from '../../hooks/useAdminSession';
import { ADMIN_NAV } from '../../routes';
import { Button } from '../ui/Button';

const baseLink =
  'rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-purple';
const activeLink = 'bg-brand-gradient text-white shadow-sm';
const idleLink = 'text-slate-700 hover:bg-slate-100';

/**
 * Moldura de todas as telas do painel: confere a sessão uma vez só, mostra o
 * cabeçalho com o nome de quem entrou, o botão Sair e o menu. A tela da rota
 * atual aparece no lugar do <Outlet />.
 */
export function AdminLayout() {
  const session = useAdminSession();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState<string | null>(null);

  if (session.status === 'checking') return <StatusPanel message="Validando sua sessão..." />;
  if (session.status === 'unauthenticated') return <Navigate to="/login" replace />;
  if (session.status === 'forbidden') {
    return <StatusPanel message="Você não tem permissão para acessar esta área." />;
  }
  if (session.status === 'error') {
    return <StatusPanel message={session.error ?? 'Não foi possível validar sua sessão.'} />;
  }

  const papel = session.user?.papel;
  const menu = ADMIN_NAV.filter((item) => !item.roles || (papel && item.roles.includes(papel)));

  async function handleLogout() {
    setLogoutError(null);
    try {
      await session.logout();
      navigate('/login');
    } catch (error: unknown) {
      setLogoutError(error instanceof Error ? error.message : 'Não foi possível sair.');
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="bg-brand-gradient px-4 py-6 text-white sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wide text-white/80 uppercase">SMCELT</p>
            <h1 className="mt-1 text-2xl font-bold">Painel administrativo</h1>
            <p className="mt-1 text-sm text-white/80">Olá, {session.user?.nome ?? ''}.</p>
          </div>
          <Button
            variant="secondary"
            className="border-white text-white hover:bg-white/10"
            onClick={() => void handleLogout()}
          >
            Sair
          </Button>
        </div>
      </header>

      <nav aria-label="Menu do painel" className="border-b border-slate-200 bg-white px-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl gap-1 overflow-x-auto py-2">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) => `${baseLink} ${isActive ? activeLink : idleLink}`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">
        {logoutError ? (
          <p
            className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-900"
            role="alert"
          >
            {logoutError}
          </p>
        ) : null}
        <Outlet />
      </main>
    </div>
  );
}

function StatusPanel({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div
        className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
        role="status"
      >
        <p className="text-slate-700">{message}</p>
      </div>
    </div>
  );
}
