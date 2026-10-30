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
  estabelecimentoId: string;
  publicado: boolean;
  enviadoEm: string;
  atualizadoEm: string;
  validadoEm: string | null;
  validadoPorId: string | null;
  publicadoEm: string | null;
  estabelecimento: { id: string; nome: string; cnpjCadastur: string; tipo: string; ativo: boolean };
  validadoPor: { id: string; nome: string } | null;
}

export interface Paginacao {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}

export interface ColetaResponse {
  message: string;
  coleta: ColetaAdminItem;
}

export interface ListColetasResponse {
  coletas: ColetaAdminItem[];
  paginacao: Paginacao;
}

export interface Setor {
  id: string;
  nome: string;
  descricao: string | null;
}

export interface ListSetoresResponse {
  setores: Setor[];
}

export interface Indicador {
  id: string;
  nome: string;
  unidade: string;
  descricao: string | null;
  setorId: string;
  setor: Setor;
}

export interface ListIndicadoresResponse {
  indicadores: Indicador[];
}

export interface RegistroIndicador {
  id: string;
  indicadorId: string;
  fonteId: string;
  indicador: Indicador;
  fonte: {
    id: string;
    nome: string;
    tipo: string;
    descricao: string | null;
    referencia: string | null;
  };
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
  observacao?: string | null;
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

export interface ApiHighlightMetric {
  id: string;
  valor: number;
  rotulo: string;
  legenda: string;
}

export interface ListHighlightMetricsResponse {
  destaques: ApiHighlightMetric[];
}

export type ReportType = 'TRIMESTRAL' | 'SETORIAL' | 'ANUAL';

export interface PublicReport {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: ReportType;
  periodoReferencia: string;
  publicadoEm: string;
  arquivoUrl: string | null;
}

export interface ListReportsResponse {
  relatorios: PublicReport[];
}

export interface CreateReportRequest {
  titulo: string;
  descricao?: string;
  tipo: ReportType;
  periodoReferencia: string;
}

export interface AdminReport extends Omit<CreateReportRequest, 'descricao'> {
  id: string;
  descricao: string | null;
  arquivoNome: string | null;
  arquivoTamanho: number | null;
  arquivoUrl: string | null;
  criadoPorId: string;
  criadoPor: { id: string; nome: string };
  publicado: boolean;
  criadoEm: string;
  atualizadoEm: string;
  publicadoEm: string | null;
}

export interface ReportResponse {
  message: string;
  relatorio: AdminReport;
}

export type PitCategory = string;

export interface PitItem {
  id: string;
  nome: string;
  categoria: PitCategory;
  descricao: string | null;
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
  descricao?: string;
  localizacao: string;
  imagemUrl?: string | null;
  ativo?: boolean;
  revisaoPrevistaEm?: string;
}

export interface UpdatePitItemRequest {
  nome?: string;
  categoria?: PitCategory;
  descricao?: string | null;
  localizacao?: string;
  imagemUrl?: string | null;
  ativo?: boolean;
  revisaoPrevistaEm?: string;
}

export interface AdminPitItem extends PitItem {
  ativo: boolean;
  criadoEm: string;
  revisadoEm: string;
  revisaoPrevistaEm: string;
  revisaoPendente: boolean;
}

export interface PitItemResponse {
  message: string;
  item: AdminPitItem;
}
