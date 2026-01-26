import { Worker } from "bullmq";
import { prisma } from "../../infra/db/prisma";
import { LocalStorageAdapter } from "../../infra/storage/local.adapter";
import { QUEUE_NAMES } from "../../shared/constants";
import { exportService } from "../../modules/export/export.service";
import { activityService } from "../../modules/activity/activity.service";
import { billingService } from "../../modules/billing/billing.service";
import { logger } from "../../shared/logger";
import { redisConnectionOptions } from "../../infra/redis/redis";
import { renderResumeHtml } from "@/infra/pdf/resume-template";
import { renderPdfFromHtml } from "@/infra/pdf/gotenberg";

const storage = new LocalStorageAdapter();

const formatDateKey = (date: Date) => date.toISOString().slice(0, 10);

export const startPdfWorker = () => {
  return new Worker(
    QUEUE_NAMES.pdf,
    async (job) => {
      const { exportId, snapshotId, userId } = job.data as {
        exportId: string;
        snapshotId: string;
        userId: string;
      };

      const snapshot = await prisma.resumeSnapshot.findFirst({
        where: { id: snapshotId, userId },
      });

      if (!snapshot) {
        throw new Error("Snapshot not found");
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { plan: true },
      });
      if (!user) {
        throw new Error("User not found");
      }

      const html = renderResumeHtml(snapshot.data);
      const pdfBuffer = await renderPdfFromHtml(html);

      try {
        await billingService.enforceDailyUploadLimit(userId, user.planId, pdfBuffer.length);

        const dateKey = formatDateKey(new Date());
        const key = `${userId}/${dateKey}/exports/${exportId}.pdf`;
        const upload = await storage.uploadBuffer(pdfBuffer, key, {
          contentType: "application/pdf",
          contentDisposition: `attachment; filename="resume-${exportId}.pdf"`,
        });

        await exportService.markReady(exportId, upload.key, user.plan?.code ?? "FREE");
        await activityService.log(userId, "resume.exported", {
          exportId,
          snapshotId,
          storageKey: upload.key,
        });
      } catch (error) {
        logger.error("PDF generation failed", { exportId, error });
        await exportService.markFailed(exportId, error instanceof Error ? error.message : "PDF failed");
        throw error;
      }
    },
    {
      connection: redisConnectionOptions,
    },
  );
};
