import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { login } from '../services/auth';
import type { LoginResponse } from '../types';
import { useLoginForm } from './useLoginForm';

vi.mock('../services/auth', () => ({
  login: vi.fn(),
}));

const response: LoginResponse = {
  usuario: {
    id: 'user-1',
    nome: 'Maria Silva',
    email: 'maria@example.com',
    papel: 'SUPER_ADMIN',
    status: 'APROVADO',
  },
};

describe('useLoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inicializa com valores vazios e estado idle', () => {
    const { result } = renderHook(() => useLoginForm());

    expect(result.current.values).toEqual({ email: '', senha: '' });
    expect(result.current.errors).toEqual({});
    expect(result.current.status).toBe('idle');
    expect(result.current.feedback).toBeNull();
  });

  it('valida os campos e não chama a API quando o formulário é inválido', async () => {
    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.errors).toEqual({
      email: 'Informe seu e-mail.',
      senha: 'Informe sua senha.',
    });
    expect(login).not.toHaveBeenCalled();
  });

  it('envia o login, define feedback de sucesso e chama onSuccess com a resposta', async () => {
    const onSuccess = vi.fn();
    vi.mocked(login).mockResolvedValueOnce(response);
    const { result } = renderHook(() => useLoginForm(onSuccess));

    act(() => {
      result.current.updateField('email', 'maria@example.com');
      result.current.updateField('senha', 'senha-segura');
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(login).toHaveBeenCalledWith({
      email: 'maria@example.com',
      senha: 'senha-segura',
    });
    expect(result.current.status).toBe('success');
    expect(result.current.feedback).toBe('Bem-vindo, Maria Silva.');
    expect(onSuccess).toHaveBeenCalledWith(response);
  });

  it('exibe o erro retornado pela API', async () => {
    vi.mocked(login).mockRejectedValueOnce(new Error('Credenciais inválidas.'));
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.updateField('email', 'maria@example.com');
      result.current.updateField('senha', 'senha-incorreta');
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.feedback).toBe('Credenciais inválidas.');
  });
});
