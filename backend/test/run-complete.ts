import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdtemp, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { Client } from 'pg';

const backend = fileURLToPath(new URL('../', import.meta.url));
const prefixoPasta = 'observasrs-test-';

function executar(arquivo: string, args: string[], ambiente: NodeJS.ProcessEnv) {
  const resultado = spawnSync(process.execPath, [join(backend, arquivo), ...args], {
    cwd: backend,
    env: ambiente,
    stdio: 'inherit',
  });
  if (resultado.error) throw resultado.error;
  return resultado.status ?? 1;
}

async function executarSuite() {
  config({ path: join(backend, '.env'), quiet: true });
  const conexao = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!conexao) throw new Error('Configure TEST_DATABASE_URL ou DATABASE_URL no backend/.env.');

  const servidor = new URL(conexao);
  if (
    !['postgres:', 'postgresql:'].includes(servidor.protocol) ||
    !['localhost', '127.0.0.1', '[::1]'].includes(servidor.hostname)
  ) {
    throw new Error('Informe uma URL de PostgreSQL local em TEST_DATABASE_URL.');
  }

  // A conexao administrativa nunca aponta para o banco da aplicacao.
  servidor.search = '';
  servidor.pathname = '/postgres';
  const nomeBanco = `observasrs_test_${randomUUID().replaceAll('-', '')}`;
  const urlTeste = new URL(servidor);
  urlTeste.pathname = `/${nomeBanco}`;

  const raizTemporaria = await realpath(tmpdir());
  const pastaPdf = await mkdtemp(join(raizTemporaria, prefixoPasta));
  const cliente = new Client({ connectionString: servidor.href, connectionTimeoutMillis: 5000 });
  let bancoCriado = false;
  try {
    try {
      await cliente.connect();
      await cliente.query(`CREATE DATABASE "${nomeBanco}" TEMPLATE template0`);
      bancoCriado = true;
    } catch (error) {
      const codigo = error instanceof Error && 'code' in error ? ` (${error.code})` : '';
      throw new Error(
        `Falha ao preparar o banco de teste${codigo}. Confira o PostgreSQL local, as credenciais e a permissao CREATEDB.`,
        { cause: error },
      );
    }

    const ambiente = {
      ...process.env,
      NODE_ENV: 'test',
      DATABASE_URL: urlTeste.href,
      OBSERVASRS_TEST_DATABASE_URL: urlTeste.href,
      OBSERVASRS_TEST_STORAGE_DIR: pastaPdf,
    };
    const prismaCli = 'node_modules/prisma/build/index.js';
    if (executar(prismaCli, ['generate'], ambiente) !== 0) return 1;
    if (executar(prismaCli, ['migrate', 'deploy'], ambiente) !== 0) return 1;
    return executar('node_modules/vitest/vitest.mjs', ['run'], ambiente);
  } finally {
    try {
      if (bancoCriado) await cliente.query(`DROP DATABASE "${nomeBanco}"`);
    } finally {
      try {
        await cliente.end();
      } finally {
        if (dirname(pastaPdf) === raizTemporaria && basename(pastaPdf).startsWith(prefixoPasta)) {
          await rm(pastaPdf, { recursive: true, force: true });
        }
      }
    }
  }
}

try {
  process.exitCode = await executarSuite();
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Falha ao executar os testes completos.');
  process.exitCode = 1;
}
