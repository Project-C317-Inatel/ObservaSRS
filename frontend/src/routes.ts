export interface NavItem {
  path: string;
  label: string;
}

/** Links públicos do cabeçalho */
export const PUBLIC_NAV: readonly NavItem[] = [
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