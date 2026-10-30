import type { PublicReport, ReportType } from '../../types';

export type { PublicReport, ReportType };

export const PUBLIC_REPORTS: readonly PublicReport[] = [
  {
    id: '4',
    titulo: 'Relatório OT nº 004/2025',
    descricao: 'Dados de ocupação hoteleira – 2º trimestre',
    tipo: 'TRIMESTRAL',
    periodoReferencia: '2025-T2',
    publicadoEm: '2025-06-15',
    arquivoUrl: null,
  },
  {
    id: '3',
    titulo: 'Relatório OT nº 003/2025',
    descricao: 'Fluxo de visitantes – 1º trimestre',
    tipo: 'TRIMESTRAL',
    periodoReferencia: '2025-T1',
    publicadoEm: '2025-03-15',
    arquivoUrl: null,
  },
  {
    id: '2',
    titulo: 'Relatório OT nº 002/2025',
    descricao: 'Diagnóstico setorial – Gastronomia',
    tipo: 'SETORIAL',
    periodoReferencia: '2025-02',
    publicadoEm: '2025-02-15',
    arquivoUrl: null,
  },
  {
    id: '1',
    titulo: 'Relatório OT nº 001/2025',
    descricao: 'Panorama anual do turismo 2024',
    tipo: 'ANUAL',
    periodoReferencia: '2024',
    publicadoEm: '2025-01-15',
    arquivoUrl: null,
  },
];

const monthFormat = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "2025-06-15" → "Jun 2025" */
export function formatReportDate(isoDate: string): string {
  const parts = monthFormat.formatToParts(
    new Date(isoDate.length === 10 ? `${isoDate}T00:00:00Z` : isoDate),
  );
  const month = parts.find((part) => part.type === 'month')?.value.replace('.', '') ?? '';
  const year = parts.find((part) => part.type === 'year')?.value ?? '';
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${year}`;
}
