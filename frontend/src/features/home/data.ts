import iconeEmprego from '../../assets/icons/emprego.png';
import iconeEmpresa from '../../assets/icons/empresa.png';
import iconeHotel from '../../assets/icons/hotel.png';
import iconeLeito from '../../assets/icons/leito.png';

export interface HighlightMetric {
  id: string;
  value: number;
  label: string;
  caption: string;
  icon: string;
  /** Classe Tailwind do fundo do ícone (cores de dados do tema). */
  iconClass: string;
}

/**
 * Serão substituídos pelos dados de INDICADOR/REGISTRO_INDICADOR quando a API existir.
 */
export const HIGHLIGHT_METRICS: readonly HighlightMetric[] = [
  {
    id: 'hospedagens',
    value: 42,
    label: 'Hospedagens',
    caption: '+3 desde 2024',
    icon: iconeHotel,
    iconClass: 'bg-data-sky',
  },
  {
    id: 'leitos',
    value: 2730,
    label: 'Leitos ocupados',
    caption: 'Média julho/2025',
    icon: iconeLeito,
    iconClass: 'bg-brand-purple',
  },
  {
    id: 'empresas',
    value: 236,
    label: 'Empresas cadastradas',
    caption: 'Cadastur ativo',
    icon: iconeEmpresa,
    iconClass: 'bg-data-cyan',
  },
  {
    id: 'empregos',
    value: 1472,
    label: 'Empregos gerados',
    caption: 'Setor turístico',
    icon: iconeEmprego,
    iconClass: 'bg-brand-magenta',
  },
];