import type { UserRole } from './types';

export interface NavItem {
  path: string;
  label: string;
}

export interface AdminNavItem extends NavItem {
  /** Papéis que enxergam o item. Se não tiver, todos do painel enxergam. */
  roles?: readonly UserRole[];
}

/** Links públicos do cabeçalho */
export const PUBLIC_NAV: readonly NavItem[] = [
  { path: '/cidade', label: 'Conheça a cidade' },
  { path: '/indicadores', label: 'Indicadores' },
  { path: '/relatorios', label: 'Relatórios' },
  { path: '/inventario', label: 'Inventário PIT' },
  { path: '/cadastur', label: 'Cadastur/FNRH' },
];

export const COLETA_NAV: NavItem = { path: '/coleta', label: 'Coleta' };
export const LOGIN_NAV: NavItem = { path: '/login', label: 'Login SMCELT' };

/** Indicadores e Relatórios são seções da página inicial: a URL indica para onde rolar. */
export const HOME_SECTION_BY_PATH: Readonly<Record<string, string>> = {
  '/indicadores': 'indicadores',
  '/relatorios': 'relatorios',
};

/**
 * Menu do painel administrativo. Cada tela nova (coletas, relatórios, registros, PIT)
 * entra aqui quando ficar pronta, para o menu nunca ter link quebrado.
 */
export const ADMIN_NAV: readonly AdminNavItem[] = [
  { path: '/admin', label: 'Início' },
  { path: '/admin/solicitacoes', label: 'Solicitações de acesso', roles: ['SUPER_ADMIN'] },
];
