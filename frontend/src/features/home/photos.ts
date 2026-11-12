import fotoArmazem from '../../assets/photos/armazem.webp';
import fotoCasario from '../../assets/photos/casario.webp';
import fotoIgreja from '../../assets/photos/igreja.webp';
import fotoPredioVermelho from '../../assets/photos/predio-vermelho.webp';

export interface CityPhoto {
  src: string;
  alt: string;
}

/**
 * Fotos provisórias, tiradas da internet. Trocar pelas fotos da SMCELT antes do deploy:
 */
export const CITY_PHOTOS = {
  casario: { src: fotoCasario, alt: 'Casario colorido à beira da avenida, com a serra ao fundo' },
  igreja: {
    src: fotoIgreja,
    alt: 'Igreja de torre branca, com uma estátua no alto do monumento da praça',
  },
  armazem: {
    src: fotoArmazem,
    alt: 'Prédio verde histórico do Grande Armazém de Secos e Molhados',
  },
  predioVermelho: {
    src: fotoPredioVermelho,
    alt: 'Casarão histórico de fachada branca e vermelha',
  },
} satisfies Record<string, CityPhoto>;
