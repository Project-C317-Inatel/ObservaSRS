import { api } from './api';
import type {
  CreateReportRequest,
  ListReportsResponse,
  PublicReport,
  ReportResponse,
  ReportType,
} from '../types';
import { listarTodasPaginas } from './paginacao';

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
  return listarTodasPaginas<'relatorios', PublicReport>(`/relatorios${query}`, 'relatorios');
}

export function criarRelatorio(dados: CreateReportRequest): Promise<ReportResponse> {
  return api.post<ReportResponse>('/admin/relatorios', dados);
}

export function uploadRelatorio(id: string, arquivo: File): Promise<ReportResponse> {
  const dados = new FormData();
  dados.append('arquivo', arquivo);
  return api.post<ReportResponse>(`/admin/relatorios/${id}/arquivo`, dados);
}

export function alterarPublicacaoRelatorio(
  id: string,
  publicado: boolean,
): Promise<ReportResponse> {
  return api.patch<ReportResponse>(`/admin/relatorios/${id}/publicacao`, { publicado });
}
