import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { listarRegistrosPublicados } from '../../services/indicadores';
import { adaptIndicatorRecords } from './adapter';
import { INDICATOR_DATA } from './data';
import { IndicatorsPage } from './IndicatorsPage';

vi.mock('../../services/indicadores', () => ({
  listarRegistrosPublicados: vi.fn(),
}));

vi.mock('./adapter', () => ({
  adaptIndicatorRecords: vi.fn(),
}));

describe('IndicatorsPage', () => {
  beforeEach(() => {
    vi.mocked(listarRegistrosPublicados).mockResolvedValue({ registros: [] });
    vi.mocked(adaptIndicatorRecords).mockReturnValue(INDICATOR_DATA);
  });

  it('atualiza filtros, alterna o gráfico e permite limpar a seleção', async () => {
    const user = userEvent.setup();
    render(<IndicatorsPage />);

    await screen.findByRole('option', { name: '2026' });
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
