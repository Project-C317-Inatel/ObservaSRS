import { useEffect } from 'react';
import { Link } from 'react-router';

import { Button } from '../../components/ui/Button';
import { useAdminSession } from '../../hooks/useAdminSession';

export interface AdminPlaceholderPageProps {
  onLogout: () => void;
  onUnauthenticated: () => void;
}

/**
 * Página inicial do painel para ADMIN e SUPER_ADMIN. As telas de gestão de dados
 * entram em uma próxima etapa; por enquanto só SUPER_ADMIN enxerga o atalho para
 * a aprovação de contas.
 */
export function AdminPlaceholderPage({ onLogout, onUnauthenticated }: AdminPlaceholderPageProps) {
  const session = useAdminSession();

  useEffect(() => {
    if (session.status === 'unauthenticated') {
      onUnauthenticated();
    }
  }, [onUnauthenticated, session.status]);

  if (session.status === 'checking') return <StatusPanel message="Validando sua sessão..." />;
  if (session.status === 'unauthenticated') {
    return <StatusPanel message={session.error ?? 'Sua sessão expirou. Faça login novamente.'} />;
  }
  if (session.status === 'forbidden') {
    return <StatusPanel message="Você não tem permissão para acessar esta área." />;
  }
  if (session.status === 'error') {
    return <StatusPanel message={session.error ?? 'Não foi possível validar sua sessão.'} />;
  }

  async function handleLogout() {
    try {
      await session.logout();
      onLogout();
    } catch (error: unknown) {
      window.alert(error instanceof Error ? error.message : 'Não foi possível encerrar a sessão.');
    }
  }

  const isSuperAdmin = session.user?.papel === 'SUPER_ADMIN';

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-brand-gradient px-4 py-8 text-white sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/80">SMCELT</p>
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

      <section className="mx-auto w-full max-w-7xl p-4 sm:p-6">
        <p className="text-slate-600">
          As ferramentas de gestão de dados do Observatório serão disponibilizadas em breve.
        </p>
        {isSuperAdmin ? (
          <Link
            to="/admin/solicitacoes"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand-gradient px-5 py-2.5 font-medium text-white shadow-md transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-purple"
          >
            Solicitações de acesso
          </Link>
        ) : null}
      </section>
    </main>
  );
}

function StatusPanel({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div
        className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
        role="status"
      >
        <p className="text-slate-700">{message}</p>
      </div>
    </main>
  );
}
