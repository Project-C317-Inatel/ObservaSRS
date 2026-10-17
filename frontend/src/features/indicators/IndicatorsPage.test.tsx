import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { IndicatorsPage } from './IndicatorsPage';

describe('IndicatorsPage', () => {
  it('atualiza filtros, alterna o gráfico e permite limpar a seleção', async () => {
    const user = userEvent.setup();
    render(<IndicatorsPage />);

    await user.selectOptions(screen.getByLabelText('Ano'), '2026');
    await user.selectOptions(screen.getByLabelText('Setor'), 'Hotelaria');
    expect(screen.getByText('Pernoites').parentElement).toHaveTextContent('2.130');
    expect(screen.getByText('Pernoites').parentElement).toHaveTextContent('noites');

    const lineButton = screen.getByRole('button', { name: 'Linha' });
    await user.click(lineButton);
    expect(lineButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('img', { name: /gráfico do fluxo/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(screen.getByLabelText('Ano')).toHaveValue('');
    expect(screen.getByText('Pernoites').parentElement).toHaveTextContent('3.930');
  });
});
