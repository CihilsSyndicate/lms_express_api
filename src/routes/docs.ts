import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../docs/swagger';

const docsRouter = Router();

// Serve Swagger UI static files first
docsRouter.use('/', swaggerUi.serveFiles(swaggerSpec));

// setup UI
docsRouter.get(
  '/',
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
  }),
);

// Serve raw OpenAPI spec as JSON
// docsRouter.get('/swagger.json', (_req, res) => {
//   res.setHeader('Content-Type', 'application/json');
//   res.send(swaggerSpec);
// });

export default docsRouter;
