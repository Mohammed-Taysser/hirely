import 'dotenv/config';
import { startEmailWorker } from './jobs/workers/email.worker';
import { startExportCleanupWorker } from './jobs/workers/export-cleanup.worker';
import { startPdfWorker } from './jobs/workers/pdf.worker';
import { startPlanWorker } from './jobs/workers/plan.worker';
import { DomainEvents } from './modules/shared/domain/events/domain-events';
import { logger } from './shared/logger';

const pdfWorker = startPdfWorker();
const emailWorker = startEmailWorker();
const planWorker = startPlanWorker();
const exportCleanupWorker = startExportCleanupWorker();

DomainEvents.setErrorHandler((error, event) => {
  logger.error(`[DomainEvents]: Error handling ${event.constructor.name}`, {
    error,
  });
});

const shutdown = async () => {
  logger.info('Shutting down workers');
  await Promise.all([
    pdfWorker.close(),
    emailWorker.close(),
    planWorker.close(),
    exportCleanupWorker.close(),
  ]);
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

logger.info('Workers started');
