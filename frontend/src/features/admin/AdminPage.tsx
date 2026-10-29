import { useCallback, useEffect, useState } from 'react';

import { ApiRequestError } from '../../services/api';
import {
  approveAccessRequest,
  listAccessRequests,
  rejectAccessRequest,
} from '../../services/admin';
import type { AccessRequest, RequestStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { useAdminSession } from '../../hooks/useAdminSession';

type AdminFilter = 'TODOS' | RequestStatus;

const filters: AdminFilter[] = ['TODOS', 'PENDENTE', 'APROVADO', 'REJEITADO'];

function formatDate(value: string | null) {
  if (!value) return 'Não informado';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value),
  );
}

function filterLabel(filter: AdminFilter) {
  return {
    TODOS: 'Todos',
    PENDENTE: 'Pendente',
    APROVADO: 'Aprovado',
    REJEITADO: 'Rejeitado',
  }[filter];
}

function statusLabel(status: RequestStatus) {
  return filterLabel(status);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Não foi possível carregar as solicitações.';
}

export interface AdminPageProps {
  onLogout: () => void;
  onUnauthenticated: () => void;
}

export function AdminPage({ onLogout, onUnauthenticated }: AdminPageProps) {
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
      window.alert(getErrorMessage(error));
    }
  }

  return <AdminContent userName={session.user?.nome ?? ''} onLogout={() => void handleLogout()} />;
}

function AdminContent({ userName, onLogout }: { userName: string; onLogout: () => void }) {
  const [filter, setFilter] = useState<AdminFilter>('PENDENTE');
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [selected, setSelected] = useState<AccessRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listAccessRequests(filter === 'TODOS' ? undefined : filter);
      setRequests(response.solicitacoes);
    } catch (requestError: unknown) {
      setRequests([]);
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    queueMicrotask(() => void loadRequests());
  }, [loadRequests]);

  async function evaluate(request: AccessRequest, action: 'approve' | 'reject') {
    const actionLabel = action === 'approve' ? 'aprovar' : 'rejeitar';
    if (!window.confirm(`Deseja ${actionLabel} a solicitação de ${request.nome}?`)) return;

    setActiveAction(request.id);
    setError(null);
    try {
      if (action === 'approve') await approveAccessRequest(request.id);
      else await rejectAccessRequest(request.id);
      await loadRequests();
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError));
      if (requestError instanceof ApiRequestError && requestError.status === 409) {
        await loadRequests();
      }
    } finally {
      setActiveAction(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-brand-gradient px-4 py-8 text-white sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/80">SMCELT</p>
            <h1 className="mt-1 text-2xl font-bold">Painel Administrativo</h1>
            <p className="mt-1 text-sm text-white/80">Olá, {userName}.</p>
          </div>
          <Button
            variant="secondary"
            className="border-white text-white hover:bg-white/10"
            onClick={onLogout}
          >
            Sair
          </Button>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl p-4 sm:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Solicitações de acesso</h2>
            <p className="mt-1 text-sm text-slate-600">Gerencie os integrantes da equipe SMCELT.</p>
          </div>
          <label className="text-sm font-medium text-slate-700">
            Status
            <select
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 sm:w-48"
              value={filter}
              onChange={(event) => setFilter(event.target.value as AdminFilter)}
            >
              {filters.map((currentFilter) => (
                <option key={currentFilter} value={currentFilter}>
                  {filterLabel(currentFilter)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? (
          <div
            className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-900"
            role="alert"
          >
            <p>{error}</p>
            <Button className="mt-3 px-3 py-2 text-sm" onClick={() => void loadRequests()}>
              Tentar novamente
            </Button>
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-slate-600" role="status">
              Carregando solicitações...
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center text-slate-600" role="status">
              Nenhuma solicitação encontrada.
            </div>
          ) : (
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">E-mail</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Criada em</th>
                  <th className="px-4 py-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-4 py-3 font-medium">{request.nome}</td>
                    <td className="px-4 py-3">{request.email}</td>
                    <td className="px-4 py-3">{statusLabel(request.status)}</td>
                    <td className="px-4 py-3">{formatDate(request.criadoEm)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          className="px-3 py-2 text-xs"
                          variant="ghost"
                          onClick={() => setSelected(request)}
                        >
                          Visualizar
                        </Button>
                        {request.status === 'PENDENTE' ? (
                          <>
                            <Button
                              className="px-3 py-2 text-xs"
                              disabled={activeAction === request.id}
                              onClick={() => void evaluate(request, 'approve')}
                            >
                              Aprovar
                            </Button>
                            <Button
                              className="px-3 py-2 text-xs"
                              variant="secondary"
                              disabled={activeAction === request.id}
                              onClick={() => void evaluate(request, 'reject')}
                            >
                              Rejeitar
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {selected ? <RequestDetails request={selected} onClose={() => setSelected(null)} /> : null}
    </main>
  );
}

function RequestDetails({ request, onClose }: { request: AccessRequest; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/50 p-4"
      role="presentation"
    >
      <section
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-details-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="request-details-title" className="text-xl font-semibold">
              Detalhes da solicitação
            </h2>
            <p className="mt-1 text-sm text-slate-600">{request.nome}</p>
          </div>
          <Button
            variant="ghost"
            className="px-3 py-2"
            aria-label="Fechar detalhes"
            onClick={onClose}
          >
            Fechar
          </Button>
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <Detail label="Nome" value={request.nome} />
          <Detail label="E-mail" value={request.email} />
          <Detail label="Papel" value={request.papel} />
          <Detail label="Status" value={statusLabel(request.status)} />
          <Detail label="Ativo" value={request.ativo ? 'Sim' : 'Não'} />
          <Detail label="Criada em" value={formatDate(request.criadoEm)} />
          <Detail label="Atualizada em" value={formatDate(request.atualizadoEm)} />
          <Detail label="Avaliada em" value={formatDate(request.avaliadoEm)} />
          <Detail label="Avaliador" value={request.avaliadoPorId ?? 'Não informado'} />
        </dl>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm text-slate-900">{value}</dd>
    </div>
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
