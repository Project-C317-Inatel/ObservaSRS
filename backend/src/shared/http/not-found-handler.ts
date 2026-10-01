import type { RequestHandler } from 'express';

export const notFoundHandler: RequestHandler = (request, response) => {
  response.status(404).json({
    error: 'route_not_found',
    message: `A rota ${request.method} ${request.path} nao foi encontrada.`,
  });
};
