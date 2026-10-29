/**
 * Retorna true exclusivamente quando a flag VITE_USE_MOCKS estiver configurada como 'true',
 * indicando que os hooks devem retornar os dados simulados locais sem chamar a API.
 */
export function isMockMode(): boolean {
  return import.meta.env.VITE_USE_MOCKS === 'true';
}

/**
 * Retorna true quando uma falha na chamada à API (404, 500 ou NetworkError)
 * deve adotar os dados simulados como fallback transparente com status 'ready'.
 * Em build de produção sem a flag VITE_USE_MOCKS=true, retorna false para expor
 * o estado de erro real da interface.
 */
export function shouldUseFallback(): boolean {
  return isMockMode() || Boolean(import.meta.env.DEV);
}
