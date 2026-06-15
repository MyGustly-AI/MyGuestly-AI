import { Worker } from "bullmq";
import { connection } from "../mediaQueue.js";
import prisma from "../../../shared/utils/prisma.js";
import cloudinary from "../../../shared/utils/cloudinary.js";
import { aiTagQueue } from "../aiQueue.js";
import { logger } from "../../loggers/logger.js";

export function startMediaWorker() {
  const worker = new Worker(
    "media",
    async (job) => {
      if (job.name === "process") {
        return processMedia(job.data);
      }
      throw new Error(`Unknown media job: ${job.name}`);
    },
    { connection, concurrency: 2 }
  );

  worker.on("completed", (job) => {
    logger.info("Media job completed", { jobId: job.id, mediaId: job.data.mediaId });
  });

  worker.on("failed", (job, err) => {
    logger.error("Media job failed", { jobId: job?.id, mediaId: job?.data?.mediaId, error: err?.message });
  });

  logger.info("Media worker started", { queueName: "media" });
  return worker;
}

async function processMedia({ mediaId }) {
  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media) throw new Error(`Media ${mediaId} not found`);

  await prisma.media.update({
    where: { id: mediaId },
    data: { status: "PROCESSING" },
  });

  const publicId = media.publicId;
  if (publicId && publicId !== "unknown") {
    const resourceType = media.mediaType === "IMAGE" ? "image" : media.mediaType === "VIDEO" ? "video" : "raw";

    try {
      const result = await cloudinary.uploader.explicit(publicId, {
        type: "upload",
        resource_type: resourceType,
        image_metadata: true,
        eager: resourceType === "image" ? [
          { width: 400, height: 400, crop: "thumb", fetch_format: "auto", quality: "auto" },
          { width: 1200, crop: "limit", fetch_format: "auto", quality: "auto", format: "webp" }
        ] : resourceType === "video" ? [
          { width: 400, height: 400, crop: "thumb", resource_type: "video", fetch_format: "auto" },
          { width: 720, resource_type: "video", fetch_format: "auto", quality: "auto", format: "mp4" }
        ] : [],
        eager_async: false,
      });

      const variants = (result.eager || []).map((v, idx) => ({
        name: v.transformation || `variant_${idx}`,
        url: v.secure_url,
        format: v.format || null,
      }));

      const existingMeta = typeof media.metadata === 'object' && media.metadata !== null ? media.metadata : {};
      await prisma.media.update({
        where: { id: mediaId },
        data: {
          metadata: {
            ...existingMeta,
            variants,
            exif: result.image_metadata || null,
            aiTags: result.tags || [],
          },
          aiStatus: "APPROVED",
        },
      });

      logger.info("Cloudinary processing complete", { mediaId, variantsCount: variants.length });
    } catch (err) {
      logger.error("Cloudinary processing failed", { mediaId, error: err?.message || err });
    }
  }

  await prisma.media.update({
    where: { id: mediaId },
    data: { status: "READY" },
  });

  await aiTagQueue.add("tag", { mediaId }, {
    jobId: `ai-${mediaId}`,
  });

  logger.info("Media processed, AI tagging enqueued", { mediaId });
}
