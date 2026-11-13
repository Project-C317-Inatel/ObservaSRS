import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Footer } from './Footer';

describe('Footer', () => {
  it('mostra as colunas de gestão municipal e parcerias', () => {
    render(<Footer />);

    expect(screen.getByRole('heading', { name: 'Gestão municipal' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Circuitos & parcerias' })).toBeInTheDocument();
    expect(screen.getByText('Prefeitura de Santa Rita do Sapucaí')).toBeInTheDocument();
  });

  it('mostra o ano atual no copyright', () => {
    render(<Footer />);

    const ano = String(new Date().getFullYear());
    expect(screen.getByText(new RegExp(`© ${ano}`))).toBeInTheDocument();
  });
});