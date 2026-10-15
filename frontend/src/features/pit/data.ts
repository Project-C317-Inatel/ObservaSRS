export const PIT_CATEGORIES = [
  'Atração Natural',
  'Museu / Cultura',
  'Gastronomia',
  'Parque Urbano',
  'Evento / Comércio',
  'Arte / Cultura',
] as const;

export type PitCategory = (typeof PIT_CATEGORIES)[number];


export interface PitItem {
  id: number;
  nome: string;
  categoria: PitCategory;
  descricao: string;
  imagemUrl: string | null;
  localizacao: string;
  /** Data ISO (AAAA-MM-DD) da última revisão pela SMCELT. */
  atualizadoEm: string;
}

export const PIT_ITEMS: readonly PitItem[] = [
  {
    id: 1,
    nome: 'Parque Linear do Ribeirão Sapucaí',
    categoria: 'Parque Urbano',
    descricao: 'Área de lazer às margens do ribeirão, com pista de caminhada.',
    imagemUrl: null,
    localizacao: 'Centro',
    atualizadoEm: '2025-08-12',
  },
  {
    id: 2,
    nome: 'Museu de Ciência e Tecnologia',
    categoria: 'Museu / Cultura',
    descricao: 'Acervo sobre a história tecnológica do Vale da Eletrônica.',
    imagemUrl: null,
    localizacao: 'Centro',
    atualizadoEm: '2025-07-05',
  },
  {
    id: 3,
    nome: 'Feira do Empreendedor Local',
    categoria: 'Evento / Comércio',
    descricao: 'Feira periódica com produtores e pequenos negócios da cidade.',
    imagemUrl: null,
    localizacao: 'Praça central',
    atualizadoEm: '2025-07-20',
  },
  {
    id: 4,
    nome: 'Cachoeira do Véu de Noiva',
    categoria: 'Atração Natural',
    descricao: 'Queda d’água em área rural, acesso por estrada de terra.',
    imagemUrl: null,
    localizacao: 'Zona rural',
    atualizadoEm: '2025-06-01',
  },
  {
    id: 5,
    nome: 'Teatro Municipal Bibi Ferreira',
    categoria: 'Arte / Cultura',
    descricao: 'Espaço para espetáculos, mostras e apresentações escolares.',
    imagemUrl: null,
    localizacao: 'Centro',
    atualizadoEm: '2025-08-18',
  },
  {
    id: 6,
    nome: 'Gastrô Festival Mantiqueira',
    categoria: 'Gastronomia',
    descricao: 'Festival anual com chefs e restaurantes da região.',
    imagemUrl: null,
    localizacao: 'Diversos locais',
    atualizadoEm: '2025-08-10',
  },
];

export function filterPitItems(
  items: readonly PitItem[],
  category: PitCategory | null,
): readonly PitItem[] {
  return category === null ? items : items.filter((item) => item.categoria === category);
}

const dateFormat = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' });

export function formatPitDate(isoDate: string): string {
  return dateFormat.format(new Date(`${isoDate}T00:00:00Z`));
}