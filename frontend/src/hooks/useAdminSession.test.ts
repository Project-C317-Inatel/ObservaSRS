import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiRequestError } from '../services/api';
import { getCurrentUser, logout } from '../services/auth';
import { useAdminSession } from './useAdminSession';

vi.mock('../services/auth', () => ({
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
}));

describe('useAdminSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('autentica super administrador após validar a sessão', async () => {
    const user = {
      id: 'admin-1',
      nome: 'Maria Silva',
      email: 'maria@example.com',
      papel: 'SUPER_ADMIN' as const,
      status: 'APROVADO' as const,
    };
    vi.mocked(getCurrentUser).mockResolvedValueOnce({ usuario: user });

    const { result } = renderHook(() => useAdminSession());

    await waitFor(() => expect(result.current.status).toBe('authenticated'));
    expect(result.current.user).toEqual(user);
    expect(result.current.error).toBeNull();
  });

  it('autentica administrador (ADMIN) após validar a sessão', async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce({
      usuario: {
        id: 'admin-2',
        nome: 'João Silva',
        email: 'joao@example.com',
        papel: 'ADMIN',
        status: 'APROVADO',
      },
    });

    const { result } = renderHook(() => useAdminSession());

    await waitFor(() => expect(result.current.status).toBe('authenticated'));
  });

  it('marca a sessão como proibida para papéis sem acesso ao painel', async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce({
      usuario: {
        id: 'editor-1',
        nome: 'Ana Souza',
        email: 'ana@example.com',
        papel: 'EDITOR',
        status: 'APROVADO',
      },
    });

    const { result } = renderHook(() => useAdminSession());

    await waitFor(() => expect(result.current.status).toBe('forbidden'));
  });

  it('diferencia sessão expirada de outros erros da API', async () => {
    vi.mocked(getCurrentUser).mockRejectedValueOnce(
      new ApiRequestError(401, { error: 'UNAUTHORIZED', message: 'Sessão expirada.' }),
    );
    const { result } = renderHook(() => useAdminSession());

    await waitFor(() => expect(result.current.status).toBe('unauthenticated'));
    expect(result.current.error).toBe('Sessão expirada.');
  });

  it('encerra a sessão e limpa o usuário ao fazer logout', async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce({
      usuario: {
        id: 'admin-1',
        nome: 'Maria Silva',
        email: 'maria@example.com',
        papel: 'SUPER_ADMIN',
        status: 'APROVADO',
      },
    });
    vi.mocked(logout).mockResolvedValueOnce();
    const { result } = renderHook(() => useAdminSession());
    await waitFor(() => expect(result.current.status).toBe('authenticated'));

    await act(async () => {
      await result.current.logout();
    });

    expect(logout).toHaveBeenCalledOnce();
    expect(result.current.status).toBe('unauthenticated');
    expect(result.current.user).toBeNull();
  });
});
