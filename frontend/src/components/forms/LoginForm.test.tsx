import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { login } from '../../services/auth';
import { LoginForm } from './LoginForm';

vi.mock('../../services/auth', () => ({
  login: vi.fn(),
}));

describe('LoginForm', () => {
  it('renderiza título padrão e mostra validações ao submeter vazio', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    expect(screen.getByRole('heading', { name: 'Acesso administrativo' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Informe seu e-mail.')).toBeInTheDocument();
    expect(screen.getByText('Informe sua senha.')).toBeInTheDocument();
  });

  it('chama onSuccess após login válido', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    vi.mocked(login).mockResolvedValueOnce({
      usuario: {
        id: 'user-1',
        nome: 'Maria Silva',
        email: 'maria@example.com',
        papel: 'SUPER_ADMIN',
        status: 'APROVADO',
      },
    });

    render(<LoginForm title="Entrar como administrador" onSuccess={onSuccess} />);
    await user.type(screen.getByLabelText('E-mail'), 'maria@example.com');
    await user.type(screen.getByLabelText('Senha'), 'senha-segura');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Bem-vindo, Maria Silva.')).toBeInTheDocument();
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('desabilita os campos enquanto o login está em andamento', async () => {
    const user = userEvent.setup();
    let resolveLogin!: (value: {
      usuario: {
        id: string;
        nome: string;
        email: string;
        papel: 'SUPER_ADMIN';
        status: 'APROVADO';
      };
    }) => void;
    vi.mocked(login).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveLogin = resolve;
      }),
    );

    render(<LoginForm />);
    await user.type(screen.getByLabelText('E-mail'), 'maria@example.com');
    await user.type(screen.getByLabelText('Senha'), 'senha-segura');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(screen.getByRole('button', { name: 'Entrando...' })).toBeDisabled();
    expect(screen.getByLabelText('E-mail')).toBeDisabled();
    expect(screen.getByLabelText('Senha')).toBeDisabled();

    resolveLogin({
      usuario: {
        id: 'user-1',
        nome: 'Maria Silva',
        email: 'maria@example.com',
        papel: 'SUPER_ADMIN',
        status: 'APROVADO',
      },
    });
    expect(await screen.findByText('Bem-vindo, Maria Silva.')).toBeInTheDocument();
  });
});
