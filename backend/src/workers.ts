import "dotenv/config";
import { startPdfWorker } from "./jobs/workers/pdf.worker";
import { startEmailWorker } from "./jobs/workers/email.worker";
import { logger } from "./shared/logger";

const pdfWorker = startPdfWorker();
const emailWorker = startEmailWorker();

const shutdown = async () => {
  logger.info("Shutting down workers");
  await Promise.all([pdfWorker.close(), emailWorker.close()]);
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

logger.info("Workers started");
