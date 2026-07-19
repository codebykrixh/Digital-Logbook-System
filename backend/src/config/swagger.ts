import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'DigiLog API',
      version: '1.0.0',
      description:
        'REST API for DigiLog — the Smart Digital Logbook for Modern Industrial Operations.',
      contact: { name: 'DigiLog', url: 'https://digilog.app' },
      license: { name: 'MIT' },
    },
    servers: [
      { url: `http://localhost:${env.PORT}/api`, description: 'Local' },
      { url: '/api', description: 'Current host' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.ts'],
});
