import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../docs/swagger';

const docsRouter = Router();

// Serve Swagger UI static files first
docsRouter.use(swaggerUi.serve);

// Setup Swagger UI HTML
docsRouter.get(
  '/',
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
      url: '/api-docs/swagger.json',
    },
  }),
);

// Serve raw OpenAPI spec as JSON
docsRouter.get('/swagger.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

export default docsRouter;
