import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from './api';
import { listAccessRequests } from './admin';

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('admin service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista todas as solicitações sem query de status', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ solicitacoes: [] });

    await listAccessRequests();

    expect(api.get).toHaveBeenCalledWith('/admin/solicitacoes');
  });

  it('envia o status selecionado como query string', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ solicitacoes: [] });

    await listAccessRequests('APROVADO');

    expect(api.get).toHaveBeenCalledWith('/admin/solicitacoes?status=APROVADO');
  });
});
