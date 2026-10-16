import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ReportsSection } from './ReportsSection';
import { formatReportDate, type PublicReport } from './data';

const relatorio: PublicReport = {
  id: 9,
  titulo: 'Relatório de teste',
  descricao: 'Descrição',
  tipo: 'Anual',
  publicadoEm: '2025-06-15',
  arquivoUrl: '/relatorios/teste.pdf',
};

describe('Relatórios públicos', () => {
  it('mostra link de download quando o PDF existe', () => {
    render(<ReportsSection reports={[relatorio]} />);

    expect(screen.getByRole('link', { name: /Baixar PDF/ })).toHaveAttribute(
      'href',
      '/relatorios/teste.pdf',
    );
    expect(screen.getByText('Jun 2025')).toBeInTheDocument();
  });

  it('desabilita o download quando o PDF ainda não foi publicado', () => {
    render(<ReportsSection reports={[{ ...relatorio, arquivoUrl: null }]} />);

    expect(screen.queryByRole('link', { name: /Baixar PDF/ })).not.toBeInTheDocument();
    expect(screen.getByText(/PDF em breve/)).toHaveAttribute('aria-disabled', 'true');
  });

  it('mostra mensagem quando não há relatórios', () => {
    render(<ReportsSection reports={[]} />);
    expect(screen.getByText('Nenhum relatório publicado até o momento.')).toBeInTheDocument();
  });

  it('formata a data de publicação como mês e ano', () => {
    expect(formatReportDate('2025-01-15')).toBe('Jan 2025');
  });
});
