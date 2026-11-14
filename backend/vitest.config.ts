import { defineConfig } from 'vitest/config';

const databaseUrl = process.env.OBSERVASRS_TEST_DATABASE_URL;
const storageDir = process.env.OBSERVASRS_TEST_STORAGE_DIR;

if (databaseUrl || storageDir) {
  if (
    !databaseUrl ||
    !storageDir ||
    !/^\/observasrs_test_[a-f0-9]{32}$/.test(new URL(databaseUrl).pathname)
  ) {
    throw new Error('Execute npm run test:all para preparar o banco e a pasta de PDFs de teste.');
  }
}

const completo = Boolean(databaseUrl);
const relatorio = 'reports/teste';

export default defineConfig({
  test: {
    environment: 'node',
    include: completo ? ['test/**/*.test.ts'] : ['test/auth.test.ts', 'test/unit/**/*.test.ts'],
    reporters: completo
      ? ['verbose', ['html', { outputDir: relatorio, singleFile: true }], 'json']
      : ['verbose'],
    ...(completo ? { outputFile: { json: `${relatorio}/resultados.json` } } : {}),
    testTimeout: 10000,
    hookTimeout: 30000,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: databaseUrl ?? 'postgresql://teste:teste@127.0.0.1:1/observasrs_test',
      JWT_SECRET: 'chave-exclusiva-dos-testes-com-mais-de-32-caracteres',
      JWT_EXPIRES_IN_SECONDS: '3600',
      AUTH_COOKIE_NAME: 'observasrs_sessao',
      CORS_ORIGIN: 'http://localhost:5173',
      ...(storageDir ? { RELATORIOS_STORAGE_DIR: storageDir } : {}),
    },
  },
});
