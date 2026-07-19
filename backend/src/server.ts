import http from 'node:http';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './config/prisma';
import { initSocket } from './services/socket';

async function bootstrap() {
  const app = createApp();
  const server = http.createServer(app);

  // Real-time layer (notifications, live incidents)
  initSocket(server);

  server.listen(env.PORT, () => {
    logger.info(`🚀 DigiLog API listening on http://localhost:${env.PORT}`);
    logger.info(`📚 API docs at http://localhost:${env.PORT}/api/docs`);
    logger.info(`🌱 Environment: ${env.NODE_ENV}`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Closed HTTP server and DB connections. Bye 👋');
      process.exit(0);
    });
    // Force-exit if it hangs
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled rejection: ${String(reason)}`);
  });
}

bootstrap().catch((err) => {
  logger.error(`Failed to start server: ${err instanceof Error ? err.stack : err}`);
  process.exit(1);
});
