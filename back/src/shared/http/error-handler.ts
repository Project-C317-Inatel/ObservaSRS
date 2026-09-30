import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      error: 'validation_error',
      message: 'Os dados enviados sao invalidos.',
      details: error.issues,
    });
    return;
  }

  console.error(error);

  response.status(500).json({
    error: 'internal_server_error',
    message: 'Ocorreu um erro interno no servidor.',
  });
};
