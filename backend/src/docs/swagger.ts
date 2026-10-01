import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

import { openApiDocument } from './openapi.js';

const swaggerOptions = {
  customSiteTitle: 'ObservaSRS API',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    tryItOutEnabled: true,
    withCredentials: true,
  },
};

export function registrarSwagger(app: Express): void {
  app.get('/docs.json', (_request, response) => {
    response.status(200).json(openApiDocument);
  });

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, swaggerOptions));
}
