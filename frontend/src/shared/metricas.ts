/** Mapeamento visual explicito: a API identifica indicadores por UUID e nao possui codigo. */
export function codigoVisual(nome: string): string {
  const chave = nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  const aliases: Record<string, string> = {
    fluxo_de_visitantes: 'visitantes',
    taxa_de_ocupacao: 'taxa_ocupacao',
    taxa_de_ocupacao_hoteleira: 'taxa_ocupacao',
    leitos_ocupados: 'leitos',
    meios_de_hospedagem: 'hospedagens',
    empresas_cadastradas: 'empresas',
    empregos_gerados: 'empregos',
  };
  return aliases[chave] ?? chave;
}
