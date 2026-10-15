import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  approveAccessRequest,
  listAccessRequests,
  rejectAccessRequest,
} from '../../services/admin';
import type { AccessRequest } from '../../types';
import { AdminPage } from './AdminPage';

const session = {
  status: 'authenticated' as const,
  user: {
    id: 'admin-1',
    nome: 'Maria Silva',
    email: 'maria@example.com',
    papel: 'SUPER_ADMIN' as const,
    status: 'APROVADO' as const,
  },
  error: null,
  logout: vi.fn(),
};

const request: AccessRequest = {
  id: 'request-1',
  nome: 'João Silva',
  email: 'joao@example.com',
  papel: 'ADMIN',
  status: 'PENDENTE',
  ativo: false,
  avaliadoEm: null,
  avaliadoPorId: null,
  criadoEm: '2026-10-14T12:00:00.000Z',
  atualizadoEm: '2026-10-14T12:00:00.000Z',
};

vi.mock('../../hooks/useAdminSession', () => ({
  useAdminSession: () => session,
}));

vi.mock('../../services/admin', () => ({
  approveAccessRequest: vi.fn(),
  listAccessRequests: vi.fn(),
  rejectAccessRequest: vi.fn(),
}));

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listAccessRequests).mockResolvedValue({ solicitacoes: [request] });
    vi.mocked(approveAccessRequest).mockResolvedValue({
      message: 'Solicitação aprovada.',
      solicitacao: request,
    });
    vi.mocked(rejectAccessRequest).mockResolvedValue({
      message: 'Solicitação rejeitada.',
      solicitacao: request,
    });
  });

  it('carrega solicitações pendentes e permite visualizar os detalhes', async () => {
    const user = userEvent.setup();
    render(<AdminPage onLogout={vi.fn()} />);

    expect(await screen.findByText('João Silva')).toBeInTheDocument();
    expect(listAccessRequests).toHaveBeenCalledWith('PENDENTE');
    expect(screen.getAllByText('Pendente')).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'Visualizar' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('joao@example.com');
    expect(screen.getByRole('button', { name: 'Fechar detalhes' })).toBeInTheDocument();
  });

  it('filtra solicitações pelo status selecionado', async () => {
    const user = userEvent.setup();
    render(<AdminPage onLogout={vi.fn()} />);

    await screen.findByText('João Silva');
    await user.selectOptions(screen.getByLabelText('Status'), 'APROVADO');

    await waitFor(() => expect(listAccessRequests).toHaveBeenLastCalledWith('APROVADO'));
  });

  it('confirma e aprova uma solicitação pendente', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<AdminPage onLogout={vi.fn()} />);

    await screen.findByText('João Silva');
    await user.click(screen.getByRole('button', { name: 'Aprovar' }));

    await waitFor(() => expect(approveAccessRequest).toHaveBeenCalledWith('request-1'));
    expect(window.confirm).toHaveBeenCalledWith('Deseja aprovar a solicitação de João Silva?');
  });
});
