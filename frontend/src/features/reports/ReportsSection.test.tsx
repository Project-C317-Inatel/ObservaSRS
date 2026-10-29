import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ReportsSection } from './ReportsSection';
import { formatReportDate } from './data';

vi.mock('./useReports', () => ({
  useReports: vi.fn(),
}));

vi.mock('../../services/relatorios', () => ({
  resolverUrlDownload: vi.fn((url: string | null) => url),
}));

import { useReports } from './useReports';

const mockUseReports = vi.mocked(useReports);

describe('Relatórios públicos', () => {
  it('mostra carregando enquanto busca dados', () => {
    mockUseReports.mockReturnValue({ reports: [], status: 'loading', error: null });

    render(<ReportsSection />);

    expect(screen.getByText(/Carregando relatórios/)).toBeInTheDocument();
  });

  it('mostra mensagem de erro quando a API falha', () => {
    mockUseReports.mockReturnValue({
      reports: [],
      status: 'error',
      error: new Error('Falha ao buscar os relatórios.'),
    });

    render(<ReportsSection />);

    expect(screen.getByText('Falha ao buscar os relatórios.')).toBeInTheDocument();
  });

  it('mostra mensagem quando não há relatórios', () => {
    mockUseReports.mockReturnValue({ reports: [], status: 'ready', error: null });

    render(<ReportsSection />);

    expect(screen.getByText('Nenhum relatório publicado até o momento.')).toBeInTheDocument();
  });

  it('mostra link de download quando o PDF existe (id string)', () => {
    mockUseReports.mockReturnValue({
      reports: [
        {
          id: '9',
          titulo: 'Relatório de teste',
          descricao: 'Descrição',
          tipo: 'Anual',
          publicadoEm: '2025-06-15',
          arquivoUrl: '/relatorios/teste.pdf',
        },
      ],
      status: 'ready',
      error: null,
    });

    render(<ReportsSection />);

    expect(screen.getByRole('link', { name: /Baixar PDF/ })).toHaveAttribute(
      'href',
      '/relatorios/teste.pdf',
    );
    expect(screen.getByText('Jun 2025')).toBeInTheDocument();
  });

  it('desabilita o download quando o PDF ainda não foi publicado', () => {
    mockUseReports.mockReturnValue({
      reports: [
        {
          id: '9',
          titulo: 'Relatório de teste',
          descricao: 'Descrição',
          tipo: 'Anual',
          publicadoEm: '2025-06-15',
          arquivoUrl: null,
        },
      ],
      status: 'ready',
      error: null,
    });

    render(<ReportsSection />);

    expect(screen.queryByRole('link', { name: /Baixar PDF/ })).not.toBeInTheDocument();
    expect(screen.getByText(/PDF em breve/)).toHaveAttribute('aria-disabled', 'true');
  });

  it('formata a data de publicação como mês e ano', () => {
    expect(formatReportDate('2025-01-15')).toBe('Jan 2025');
  });
});
