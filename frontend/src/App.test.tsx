import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';

const loginForm = vi.fn();
const adminPage = vi.fn();

vi.mock('./components/forms/ColetaAutonomaForm', () => ({
  ColetaAutonomaForm: () => <div>Coleta mockada</div>,
}));

vi.mock('./features/indicators/IndicatorsPage', () => ({
  IndicatorsPage: () => <div>Indicadores mockados</div>,
}));

vi.mock('./components/forms/LoginForm', () => ({
  LoginForm: (props: { onSuccess?: () => void }) => {
    loginForm(props);
    return <button onClick={props.onSuccess}>Login mockado</button>;
  },
}));

vi.mock('./features/admin/AdminPage', () => ({
  AdminPage: (props: { onLogout: () => void }) => {
    adminPage(props);
    return <button onClick={props.onLogout}>Sair mockado</button>;
  },
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, '', '/');
  });

  it('navega para o painel após o sucesso do login e retorna ao início no logout', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Login mockado' }));
    expect(screen.getByText('Sair mockado')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/admin');
    expect(adminPage).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: 'Sair mockado' }));
    expect(screen.getByText('Login mockado')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
  });

  it('renderiza diretamente o painel quando a rota inicial é /admin', () => {
    window.history.replaceState({}, '', '/admin');
    render(<App />);

    expect(screen.getByText('Sair mockado')).toBeInTheDocument();
    expect(loginForm).not.toHaveBeenCalled();
  });
});
