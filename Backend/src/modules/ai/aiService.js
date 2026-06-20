import { AppError } from "../../shared/utils/AppError.js";
import { redis } from "../../config/redis.js";
import { aiTagQueue } from "../../infra/queues/aiQueue.js";
import { logger } from "../../infra/loggers/logger.js";

const TIMELINE_CACHE_TTL = 60 * 60;

export class AIService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async getTimeline(eventId) {
    const cached = await redis.get(`event:${eventId}:timeline`);
    if (cached) return JSON.parse(cached);

    const media = await this.prisma.media.findMany({
      where: { eventId, deletedAt: null },
      include: { tags: true },
      orderBy: { createdAt: "asc" },
    });

    const timeClusters = this.clusterByTime(media);
    const timeline = timeClusters.map((cluster, index) => ({
      moment: `Moment ${index + 1}`,
      time: cluster.time,
      items: cluster.items.map((m) => ({
        id: m.id,
        url: m.url,
        mediaType: m.mediaType,
        tags: m.tags.map((t) => t.label),
        createdAt: m.createdAt,
      })),
    }));

    await redis.set(
      `event:${eventId}:timeline`,
      JSON.stringify(timeline),
      "EX",
      TIMELINE_CACHE_TTL,
    );

    return timeline;
  }

  async retagEvent(eventId) {
    const mediaItems = await this.prisma.media.findMany({
      where: { eventId, deletedAt: null },
      select: { id: true },
    });

    if (mediaItems.length === 0) {
      throw AppError.badRequest("No media found for this event");
    }

    for (const m of mediaItems) {
      await aiTagQueue.add("tag", { mediaId: m.id }, {
        jobId: `ai-${m.id}-${Date.now()}`,
      });
    }

    logger.info("Retagging enqueued", { eventId, count: mediaItems.length });

    return { enqueued: mediaItems.length };
  }

  clusterByTime(media) {
    if (media.length === 0) return [];

    const clusters = [];
    let currentCluster = { time: media[0].createdAt, items: [media[0]] };
    const gapMs = 30 * 60 * 1000;

    for (let i = 1; i < media.length; i++) {
      const timeDiff = new Date(media[i].createdAt) - new Date(media[i - 1].createdAt);
      if (timeDiff < gapMs) {
        currentCluster.items.push(media[i]);
      } else {
        clusters.push(currentCluster);
        currentCluster = { time: media[i].createdAt, items: [media[i]] };
      }
    }
    clusters.push(currentCluster);
    return clusters;
  }
}
