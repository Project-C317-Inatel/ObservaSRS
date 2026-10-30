import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CompaniesBySectorChart } from './CompaniesBySectorChart';
import { COMPANIES_BY_SECTOR, totalCompanies } from './data';

describe('Gráfico de empresas por setor', () => {
  it('mostra o título e o total de empresas', () => {
    render(<CompaniesBySectorChart />);

    expect(screen.getByRole('heading', { name: 'Empresas por setor' })).toBeInTheDocument();
    expect(screen.getByText('236 empresas com Cadastur ativo.')).toBeInTheDocument();
  });

  it('descreve os dados de cada setor para leitores de tela', () => {
    render(<CompaniesBySectorChart />);

    const grafico = screen.getByRole('img', { name: /Gráfico de empresas por setor/ });
    expect(grafico).toHaveAccessibleName(expect.stringContaining('Alimentação: 72'));
    expect(grafico).toHaveAccessibleName(expect.stringContaining('Eventos: 19'));
  });

  it('mostra mensagem quando não há dados', () => {
    render(<CompaniesBySectorChart data={[]} />);

    expect(screen.getByText('Nenhuma empresa cadastrada.')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('os dados fictícios somam 236, o mesmo total do card da Home', () => {
    expect(totalCompanies(COMPANIES_BY_SECTOR)).toBe(236);
  });
});
