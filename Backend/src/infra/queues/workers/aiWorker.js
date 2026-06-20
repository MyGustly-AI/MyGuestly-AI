import { Worker } from "bullmq";
import { connection } from "../emailQueue.js";
import prisma from "../../../shared/utils/prisma.js";
import { redis } from "../../../config/redis.js";
import { logger } from "../../loggers/logger.js";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function callOpenAI(messages) {
  if (!OPENAI_API_KEY) {
    logger.warn("OpenAI API key not configured, using fallback tagging");
    return null;
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

const TAG_CANDIDATES = [
  "ceremony", "reception", "dance", "guest-interaction",
  "decorations", "food", "portrait", "crowd", "performance",
  "cake-cutting", "first-dance", "vows", "speech",
];

export function startAiWorker() {
  const worker = new Worker(
    "ai.tag",
    async (job) => {
      const { mediaId } = job.data;

      const media = await prisma.media.findUnique({ where: { id: mediaId } });
      if (!media) throw new Error(`Media ${mediaId} not found`);

      let tags = [];

      try {
        const result = await callOpenAI([
          {
            role: "system",
            content: `You are an event media tagger. Analyze media and return a JSON object with an array of labels from: ${TAG_CANDIDATES.join(", ")}. Also return a confidence score 0-1 for each. Format: { "labels": [{"label": "...", "confidence": 0.9}] }`,
          },
          {
            role: "user",
            content: `Tag this event media with id ${mediaId} of type ${media.mediaType} from event ${media.eventId}.`,
          },
        ]);

        if (result?.labels) {
          tags = result.labels;
        }
      } catch (err) {
        logger.error("OpenAI tagging failed, using fallback", {
          mediaId, error: err.message,
        });

        tags = [{ label: "guest-interaction", confidence: 0.3 }];
      }

      for (const tag of tags) {
        await prisma.mediaTag.upsert({
          where: { mediaId_label: { mediaId, label: tag.label } },
          create: { mediaId, label: tag.label, confidence: tag.confidence, source: "ai" },
          update: { confidence: tag.confidence },
        });
      }

      await redis.del(`event:${media.eventId}:timeline`);

      logger.info("AI tagging completed", { mediaId, tags: tags.map((t) => t.label) });
    },
    { connection, concurrency: 3 },
  );

  worker.on("completed", (job) => {
    logger.info("AI tagging job completed", { jobId: job.id, mediaId: job.data.mediaId });
  });

  worker.on("failed", (job, err) => {
    logger.error("AI tagging job failed", { jobId: job?.id, mediaId: job?.data?.mediaId, error: err?.message });
  });

  logger.info("AI worker started");
  return worker;
}
