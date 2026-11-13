import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';

describe('Button', () => {
  it('mostra o texto e usa type="button" por padrão', () => {
    render(<Button>Salvar</Button>);

    const botao = screen.getByRole('button', { name: 'Salvar' });
    expect(botao).toHaveAttribute('type', 'button');
  });

  it('chama o onClick quando clicado', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Enviar</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('não chama o onClick quando está desabilitado', async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Enviar
      </Button>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('aplica a classe da variante escolhida', () => {
    render(<Button variant="secondary">Cancelar</Button>);

    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveClass('border-brand-purple');
  });
});