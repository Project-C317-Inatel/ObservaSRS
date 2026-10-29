import { api } from './api';
import type { ListReportsResponse, ReportResponse, ReportType } from '../types';

export function resolverUrlDownload(arquivoUrl: string | null): string | null {
  if (!arquivoUrl) {
    return null;
  }
  if (arquivoUrl.startsWith('http://') || arquivoUrl.startsWith('https://')) {
    return arquivoUrl;
  }
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
  const prefix = arquivoUrl.startsWith('/') ? '' : '/';
  return `${baseUrl}${prefix}${arquivoUrl}`;
}

export function listarRelatorios(tipo?: ReportType): Promise<ListReportsResponse> {
  const query = tipo ? `?tipo=${encodeURIComponent(tipo)}` : '';
  return api.get<ListReportsResponse>(`/relatorios${query}`);
}

export function uploadRelatorio(dados: FormData): Promise<ReportResponse> {
  return api.post<ReportResponse>('/admin/relatorios', dados);
}

export function excluirRelatorio(id: string): Promise<void> {
  return api.delete<void>(`/admin/relatorios/${id}`);
}
