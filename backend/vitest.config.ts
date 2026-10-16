import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    reporters: ['verbose', ['html', { outputDir: 'reports/tests', singleFile: true }]],
    testTimeout: 10000,
    hookTimeout: 30000,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://teste:teste@127.0.0.1:1/observasrs_test',
      JWT_SECRET: 'chave-exclusiva-dos-testes-com-mais-de-32-caracteres',
      JWT_EXPIRES_IN_SECONDS: '3600',
      AUTH_COOKIE_NAME: 'observasrs_sessao',
      CORS_ORIGIN: 'http://localhost:5173',
    },
  },
});
