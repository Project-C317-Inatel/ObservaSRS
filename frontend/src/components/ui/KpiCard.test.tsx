import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { KpiCard } from './KpiCard';

describe('KpiCard', () => {
  it('mostra o título, o valor formatado e a legenda', () => {
    render(
      <KpiCard
        label="Leitos ocupados"
        value={2730}
        caption="Média julho/2025"
        icon="icone.png"
        iconClass="bg-data-sky"
      />,
    );

    expect(screen.getByRole('heading', { name: 'Leitos ocupados' })).toBeInTheDocument();
    expect(screen.getByText('2.730')).toBeInTheDocument();
    expect(screen.getByText('Média julho/2025')).toBeInTheDocument();
  });

  it('não mostra a legenda quando ela não é informada', () => {
    render(<KpiCard label="Hospedagens" value={42} icon="icone.png" iconClass="bg-data-sky" />);

    expect(screen.getByRole('heading', { name: 'Hospedagens' })).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.queryByText('Média julho/2025')).not.toBeInTheDocument();
  });
});
