import { AppError } from "../../shared/utils/AppError.js";
import { redis } from "../../config/redis.js";
import { aiTagQueue } from "../../infra/queues/aiQueue.js";
import { logger } from "../../infra/loggers/logger.js";
import { OpenAI } from "openai";

const TIMELINE_CACHE_TTL = 60 * 60;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "missing_key",
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
});

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

  async organizeEventMoments(mediaDescriptions) {
    try {
      const response = await openai.chat.completions.create({
        model: "llama3-8b-8192", 
        messages: [
          { 
            role: "system", 
            content: "You are an event memory assistant. Categorize the following media descriptions into meaningful event moments (e.g., Ceremony, Reception, Dance). Return the result as a structured JSON object where keys are the categories and values are arrays of the media items." 
          },
          { 
            role: "user", 
            content: JSON.stringify(mediaDescriptions) 
          }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error("AI Integration Error:", error);
      throw AppError.internal("Failed to organize event moments");
    }
  }
}
