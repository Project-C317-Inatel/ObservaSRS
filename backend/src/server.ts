import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './shared/database/prisma.js';

const server = app.listen(env.PORT, () => {
  console.log(`ObservaSRS API executando em http://localhost:${env.PORT}`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`Recebido ${signal}. Encerrando a API...`);

  server.close(async (error) => {
    if (error) {
      console.error('Nao foi possivel encerrar o servidor corretamente.', error);
      process.exit(1);
    }

    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
