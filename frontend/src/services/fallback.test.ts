import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isMockMode, shouldUseFallback } from './fallback';

describe('fallback service', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('retorna true para isMockMode e shouldUseFallback quando VITE_USE_MOCKS é true', () => {
    vi.stubEnv('VITE_USE_MOCKS', 'true');
    vi.stubEnv('DEV', false);

    expect(isMockMode()).toBe(true);
    expect(shouldUseFallback()).toBe(true);
  });

  it('retorna isMockMode false e shouldUseFallback true em ambiente dev sem VITE_USE_MOCKS', () => {
    vi.stubEnv('VITE_USE_MOCKS', 'false');
    vi.stubEnv('DEV', true);

    expect(isMockMode()).toBe(false);
    expect(shouldUseFallback()).toBe(true);
  });

  it('retorna false para isMockMode e shouldUseFallback em ambiente de produção sem a flag', () => {
    vi.stubEnv('VITE_USE_MOCKS', 'false');
    vi.stubEnv('DEV', false);

    expect(isMockMode()).toBe(false);
    expect(shouldUseFallback()).toBe(false);
  });
});
