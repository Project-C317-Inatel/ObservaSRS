import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ColetaAutonomaForm } from './ColetaAutonomaForm';
import { enviarColeta } from '../../services/coleta';
import type { ColetaAutonomaResponse } from '../../types';

vi.mock('../../services/coleta', () => ({
  enviarColeta: vi.fn(),
}));

describe('ColetaAutonomaForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o título, subtítulo e todos os 5 campos com seus labels', () => {
    render(<ColetaAutonomaForm />);

    expect(screen.getByText('Coleta Autônoma')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Envie os dados de ocupação do seu estabelecimento para validação da SMCELT.',
      ),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/nome do estabelecimento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cnpj \/ cadastur/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/período de referência/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nº de leitos ocupados/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/principal origem dos visitantes/i)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
  });

  it('deve exibir erros de validação ao submeter formulário vazio', async () => {
    const user = userEvent.setup();
    render(<ColetaAutonomaForm />);

    await user.click(screen.getByRole('button', { name: /enviar/i }));

    expect(
      await screen.findByText('Informe o nome do estabelecimento (mínimo 3 caracteres).'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Informe um CNPJ válido no formato 00.000.000/0001-00.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Selecione o período de referência.')).toBeInTheDocument();
  });

  it('deve aplicar máscara no CNPJ progressivamente ao digitar', async () => {
    const user = userEvent.setup();
    render(<ColetaAutonomaForm />);

    const cnpjInput = screen.getByLabelText(/cnpj \/ cadastur/i);
    await user.type(cnpjInput, '12345678000195');

    expect(cnpjInput).toHaveValue('12.345.678/0001-95');
  });

  it('deve submeter os dados corretamente quando o formulário for válido', async () => {
    const user = userEvent.setup();
    const mockResponse: ColetaAutonomaResponse = {
      message: 'Coleta enviada com sucesso para validação da SMCELT.',
      coleta: {
        id: 'coleta-123',
        nomeEstabelecimento: 'Grande Hotel Real',
        cnpjCadastur: '12.345.678/0001-95',
        periodoReferencia: '2026-10',
        leitosOcupados: 40,
        origemVisitantes: 'sudeste',
      },
    };

    vi.mocked(enviarColeta).mockResolvedValueOnce(mockResponse);

    render(<ColetaAutonomaForm />);

    await user.type(screen.getByLabelText(/nome do estabelecimento/i), 'Grande Hotel Real');
    await user.type(screen.getByLabelText(/cnpj \/ cadastur/i), '12345678000195');

    // Período de referência
    fireEvent.change(screen.getByLabelText(/período de referência/i), {
      target: { value: '2026-10' },
    });

    // Leitos ocupados
    const leitosInput = screen.getByLabelText(/nº de leitos ocupados/i);
    await user.clear(leitosInput);
    await user.type(leitosInput, '40');

    // Origem dos visitantes
    await user.selectOptions(screen.getByLabelText(/principal origem dos visitantes/i), 'sudeste');

    await user.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => {
      expect(enviarColeta).toHaveBeenCalledWith({
        nomeEstabelecimento: 'Grande Hotel Real',
        cnpjCadastur: '12.345.678/0001-95',
        periodoReferencia: '2026-10',
        leitosOcupados: 40,
        origemVisitantes: 'sudeste',
      });
    });

    expect(
      await screen.findByText('Coleta enviada com sucesso para validação da SMCELT.'),
    ).toBeInTheDocument();

    // Formulário deve ter resetado
    expect(screen.getByLabelText(/nome do estabelecimento/i)).toHaveValue('');
    expect(screen.getByLabelText(/cnpj \/ cadastur/i)).toHaveValue('');
  });

  it('deve desabilitar campos e exibir "Enviando..." durante requisição', async () => {
    const user = userEvent.setup();
    let resolvePromise: (value: ColetaAutonomaResponse) => void;
    const promise = new Promise<ColetaAutonomaResponse>((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(enviarColeta).mockReturnValueOnce(promise);

    render(<ColetaAutonomaForm />);

    await user.type(screen.getByLabelText(/nome do estabelecimento/i), 'Pousada Flor de Lótus');
    await user.type(screen.getByLabelText(/cnpj \/ cadastur/i), '12345678000195');
    fireEvent.change(screen.getByLabelText(/período de referência/i), {
      target: { value: '2026-10' },
    });
    const leitosInput = screen.getByLabelText(/nº de leitos ocupados/i);
    await user.clear(leitosInput);
    await user.type(leitosInput, '10');

    const submitBtn = screen.getByRole('button', { name: /enviar/i });
    await user.click(submitBtn);

    expect(screen.getByRole('button', { name: /enviando\.\.\./i })).toBeDisabled();
    expect(screen.getByLabelText(/nome do estabelecimento/i)).toBeDisabled();
    expect(screen.getByLabelText(/cnpj \/ cadastur/i)).toBeDisabled();

    // Resolve a promise
    resolvePromise!({
      message: 'Coleta enviada com sucesso!',
      coleta: {
        id: '1',
        nomeEstabelecimento: 'Pousada Flor de Lótus',
        cnpjCadastur: '12.345.678/0001-95',
        periodoReferencia: '2026-10',
        leitosOcupados: 10,
        origemVisitantes: '',
      },
    });

    expect(await screen.findByText('Coleta enviada com sucesso!')).toBeInTheDocument();
  });

  it('deve exibir mensagem de erro quando o envio falhar', async () => {
    const user = userEvent.setup();
    vi.mocked(enviarColeta).mockRejectedValueOnce(new Error('Erro de conexão ao enviar os dados.'));

    render(<ColetaAutonomaForm />);

    await user.type(screen.getByLabelText(/nome do estabelecimento/i), 'Hotel Estrela');
    await user.type(screen.getByLabelText(/cnpj \/ cadastur/i), '12345678000195');
    fireEvent.change(screen.getByLabelText(/período de referência/i), {
      target: { value: '2026-10' },
    });

    await user.click(screen.getByRole('button', { name: /enviar/i }));

    expect(await screen.findByText('Erro de conexão ao enviar os dados.')).toBeInTheDocument();
  });

  it('deve redefinir campos e erros ao clicar no botão "Limpar"', async () => {
    const user = userEvent.setup();
    render(<ColetaAutonomaForm />);

    const nomeInput = screen.getByLabelText(/nome do estabelecimento/i);
    const cnpjInput = screen.getByLabelText(/cnpj \/ cadastur/i);
    const limparBtn = screen.getByRole('button', { name: /limpar/i });

    // Clica em enviar com form vazio para disparar erros
    await user.click(screen.getByRole('button', { name: /enviar/i }));
    expect(
      await screen.findByText('Informe o nome do estabelecimento (mínimo 3 caracteres).'),
    ).toBeInTheDocument();

    // Preenche campos
    await user.type(nomeInput, 'Hotel Teste');
    await user.type(cnpjInput, '12345678000195');

    expect(nomeInput).toHaveValue('Hotel Teste');
    expect(cnpjInput).toHaveValue('12.345.678/0001-95');

    // Clica no botão Limpar
    await user.click(limparBtn);

    // Deve redefinir os campos
    expect(nomeInput).toHaveValue('');
    expect(cnpjInput).toHaveValue('');
    expect(
      screen.queryByText('Informe o nome do estabelecimento (mínimo 3 caracteres).'),
    ).not.toBeInTheDocument();
  });
});
