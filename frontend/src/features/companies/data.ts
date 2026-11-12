export interface CompaniesBySector {
  setor: string;
  quantidade: number;
}

/**
 * Dados fictícios de empresas do Cadastur por setor (somam 236, o total do card da Home).
 * Serão substituídos pelos dados da API quando a rota pública existir.
 */
export const COMPANIES_BY_SECTOR: readonly CompaniesBySector[] = [
  { setor: 'Alimentação', quantidade: 72 },
  { setor: 'Hospedagem', quantidade: 58 },
  { setor: 'Guias de turismo', quantidade: 32 },
  { setor: 'Transporte', quantidade: 31 },
  { setor: 'Agências', quantidade: 24 },
  { setor: 'Eventos', quantidade: 19 },
];

export function totalCompanies(data: readonly CompaniesBySector[]): number {
  return data.reduce((soma, item) => soma + item.quantidade, 0);
}
