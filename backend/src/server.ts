import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import qs from 'qs';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import { BODY_LIMIT, RATE_LIMITS } from './apps/constant';
import rateLimiter from './middleware/rate-limit.middleware';
import loggerService from './modules/shared/infrastructure/services/logger.service';
import errorService from './modules/shared/presentation/error.service';

import CONFIG from '@/apps/config';
import { registerApiRoutes } from '@/apps/routes';
import errorHandlerMiddleware from '@/middleware/error-handler.middleware';
import { DomainEvents } from '@/modules/shared/domain/events/domain-events';
import { registerUserSubscriptions } from '@/modules/user/infrastructure/subscriptions/subscriptions.bootstrap';

const app = express();
registerUserSubscriptions();

DomainEvents.setErrorHandler((error, event) => {
  loggerService.error(`[DomainEvents]: Error handling ${event.constructor.name}`, {
    error,
  });
});

if (CONFIG.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Load swagger document with absolute path
const swaggerDocument = YAML.load('./docs/swagger.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Make sure the body is parsed beforehand.
app.use(hpp());

// secure apps by setting various HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// rate limiter
app.use(rateLimiter(RATE_LIMITS.GENERAL));

// enable CORS - Cross Origin Resource Sharing
app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        CONFIG.ALLOWED_ORIGINS.length === 0 ||
        CONFIG.ALLOWED_ORIGINS.includes(origin)
      ) {
        callback(null, true);
      } else {
        callback(errorService.forbidden(`CORS: Origin ${origin} is not allowed`));
      }
    },
  })
);

// parse body params and attache them to req.body
app.use(express.urlencoded({ extended: true, limit: BODY_LIMIT }));
app.use(express.json({ limit: BODY_LIMIT }));

// Parse query strings using qs library
app.set('query parser', (str: string) => qs.parse(str));

// Routes
registerApiRoutes(app);

// 404 Handler
app.use((_req, _res, next) => {
  next(errorService.notFound('Resource Not Found'));
});

// Global Error Handler (last)
app.use(errorHandlerMiddleware);

const startServer = () =>
  app.listen(CONFIG.PORT, () => {
    const localUrl = `http://localhost:${CONFIG.PORT}/`;
    const docsUrl = `http://localhost:${CONFIG.PORT}/docs`;
    const healthUrl = `http://localhost:${CONFIG.PORT}/health`;

    loggerService.info('➜  Node:     ' + process.version);

    loggerService.info(`➜  ENV:      ${CONFIG.NODE_ENV.toUpperCase()}`);
    loggerService.info();

    loggerService.info('➜' + '  Local:   ' + localUrl);
    loggerService.info('➜' + '  Docs:    ' + docsUrl);
    loggerService.info('➜' + '  Health:  ' + healthUrl);
    loggerService.info('💡 Tip: ' + 'Press Ctrl+C to stop the server.' + '\n');
  });

if (CONFIG.NODE_ENV !== 'test') {
  startServer();
}

export default app;
export { startServer };
