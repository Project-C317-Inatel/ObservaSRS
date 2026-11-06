import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CityPhotoMosaic } from './CityPhotoMosaic';
import { CITY_PHOTOS } from './photos';

describe('CityPhotoMosaic', () => {
  it('mostra as quatro fotos com texto alternativo', () => {
    render(<CityPhotoMosaic />);

    const fotos = screen.getAllByRole('img');
    expect(fotos).toHaveLength(4);

    for (const foto of Object.values(CITY_PHOTOS)) {
      expect(screen.getByAltText(foto.alt)).toBeInTheDocument();
    }
  });
});