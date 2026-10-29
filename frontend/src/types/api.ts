export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';

export type RequestStatus = 'PENDENTE' | 'APROVADO' | 'REJEITADO';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface ApiUser {
  id: string;
  nome: string;
  email: string;
  papel: UserRole;
  status: RequestStatus;
}

export interface AccessRequest extends ApiUser {
  ativo: boolean;
  avaliadoEm: string | null;
  avaliadoPorId: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface LoginResponse {
  usuario: ApiUser;
}

export interface RegisterResponse {
  message: string;
  solicitacao: ApiUser;
}

export interface EvaluationResponse {
  message: string;
  solicitacao: AccessRequest;
}

export interface ListAccessRequestsResponse {
  solicitacoes: AccessRequest[];
}

export interface StatusResponse {
  status: 'positivo';
  servico: string;
}

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, unknown>[];
}

export interface ColetaAutonomaRequest {
  nomeEstabelecimento: string;
  cnpjCadastur: string;
  periodoReferencia: string;
  leitosOcupados: number;
  origemVisitantes: string;
}

export interface ColetaAutonomaResponse {
  message: string;
  coleta: { id: string } & ColetaAutonomaRequest;
}

export interface ColetaAdminItem extends ColetaAutonomaRequest {
  id: string;
  status: RequestStatus;
  criadoEm: string;
}

export interface ListColetasResponse {
  coletas: ColetaAdminItem[];
}

export interface Setor {
  id: string;
  nome: string;
  descricao: string;
}

export interface ListSetoresResponse {
  setores: Setor[];
}

export interface Indicador {
  id: string;
  nome: string;
  codigo: string;
  unidade: string;
  descricao: string;
  setor: {
    id: string;
    nome: string;
  };
}

export interface ListIndicadoresResponse {
  indicadores: Indicador[];
}

export interface RegistroIndicador {
  id: string;
  indicadorId: string;
  indicadorNome: string;
  indicadorCodigo: string;
  unidade: string;
  setorNome: string;
  periodo: string;
  valor: string;
}

export interface ListRegistrosResponse {
  registros: RegistroIndicador[];
}

export interface CreateRegistroRequest {
  indicadorId: string;
  fonteId: string;
  periodo: string;
  valor: string;
  publicado?: boolean;
  observacao?: string;
}

export interface UpdateRegistroRequest {
  valor?: string;
  observacao?: string;
  publicado?: boolean;
  periodo?: string;
  fonteId?: string;
  indicadorId?: string;
}

export interface RegistroAdminItem {
  id: string;
  indicadorId: string;
  fonteId: string;
  periodo: string;
  valor: string;
  publicado: boolean;
  observacao?: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ListRegistrosAdminResponse {
  registros: RegistroAdminItem[];
}

export interface RegistroResponse {
  message: string;
  registro: RegistroAdminItem;
}

export interface HighlightMetric {
  id: string;
  valor: number;
  rotulo: string;
  legenda: string;
}

export interface ListHighlightMetricsResponse {
  destaques: HighlightMetric[];
}

export type ReportType = 'Trimestral' | 'Setorial' | 'Anual';

export interface PublicReport {
  id: string;
  titulo: string;
  descricao: string;
  tipo: ReportType;
  publicadoEm: string;
  arquivoUrl: string | null;
}

export interface ListReportsResponse {
  relatorios: PublicReport[];
}

export interface CreateReportFormData {
  titulo: string;
  descricao: string;
  tipo: ReportType;
  publicadoEm: string;
  arquivo: File | Blob;
}

export interface ReportResponse {
  message: string;
  relatorio: PublicReport;
}

export type PitCategory =
  | 'Atração Natural'
  | 'Museu / Cultura'
  | 'Gastronomia'
  | 'Parque Urbano'
  | 'Evento / Comércio'
  | 'Arte / Cultura';

export interface PitItem {
  id: string;
  nome: string;
  categoria: PitCategory;
  descricao: string;
  imagemUrl: string | null;
  localizacao: string;
  atualizadoEm: string;
}

export interface ListPitResponse {
  itens: PitItem[];
}

export interface CreatePitItemRequest {
  nome: string;
  categoria: PitCategory;
  descricao: string;
  localizacao: string;
  imagemUrl?: string | null;
}

export interface UpdatePitItemRequest {
  nome?: string;
  categoria?: PitCategory;
  descricao?: string;
  localizacao?: string;
  imagemUrl?: string | null;
}

export interface PitItemResponse {
  message: string;
  item: PitItem;
}
