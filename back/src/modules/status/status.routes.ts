import { Router } from 'express';

export const statusRoutes = Router();

statusRoutes.get('/status', (_request, response) => {
  response.status(200).json({
    status: 'positivo',
    servico: 'observasrs-api',
  });
});
