import { app } from './app';
import { env } from './config/env';

const server = app.listen(env.PORT, () => {
  console.log(`ObservaSRS API executando em http://localhost:${env.PORT}`);
});

function shutdown(signal: string): void {
  console.log(`Recebido ${signal}. Encerrando a API...`);

  server.close((error) => {
    if (error) {
      console.error('Nao foi possivel encerrar o servidor corretamente.', error);
      process.exit(1);
    }

    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
