import type { ErrorRequestHandler } from 'express';
import { MulterError } from 'multer';
import { ZodError } from 'zod';

import { AppError } from '../errors/app-error.js';

export const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof MulterError) {
    const tamanhoExcedido = error.code === 'LIMIT_FILE_SIZE';
    response.status(tamanhoExcedido ? 413 : 400).json({
      error: tamanhoExcedido ? 'pdf_too_large' : 'invalid_upload',
      message: tamanhoExcedido
        ? 'O PDF deve ter no maximo 10 MB.'
        : 'Envie somente um PDF no campo arquivo, sem campos adicionais.',
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: error.code,
      message: error.message,
    });
    return;
  }

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
