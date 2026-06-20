import { jest } from "@jest/globals";

describe("AIService", () => {
  let AIService, service;
  let redisMock;

  beforeEach(async () => {
    jest.resetModules();

    redisMock = { get: jest.fn(), set: jest.fn(), del: jest.fn() };
    jest.unstable_mockModule("../../src/config/redis.js", () => ({ redis: redisMock }));

    jest.unstable_mockModule("ioredis", () => ({
      default: class Redis {
        constructor() {
          this.get = jest.fn().mockResolvedValue(null);
          this.set = jest.fn().mockResolvedValue("OK");
          this.del = jest.fn().mockResolvedValue(1);
          this.on = jest.fn();
          this.quit = jest.fn().mockResolvedValue("OK");
          this.status = "ready";
        }
      },
    }));

    const prismaMock = {
      media: { findMany: jest.fn(), count: jest.fn() },
      mediaTag: { findMany: jest.fn(), create: jest.fn(), deleteMany: jest.fn() },
      event: { findUnique: jest.fn() },
    };

    jest.unstable_mockModule("../../src/infra/loggers/logger.js", () => ({
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    }));

    const mod = await import("../../src/modules/ai/aiService.js");
    AIService = mod.AIService || mod.default;
    service = new AIService(prismaMock);
  });

  describe("getTimeline", () => {
    it("should return empty timeline when no media", async () => {
      redisMock.get.mockResolvedValue(null);
      service.prisma.media.findMany.mockResolvedValue([]);

      const result = await service.getTimeline("event-1");
      expect(result).toEqual([]);
    });

    it("should return cached timeline when available", async () => {
      const cached = [{ moment: "Moment 1", time: new Date().toISOString(), items: [] }];
      redisMock.get.mockResolvedValue(JSON.stringify(cached));

      const result = await service.getTimeline("event-1");
      expect(result).toEqual(cached);
      expect(service.prisma.media.findMany).not.toHaveBeenCalled();
    });
  });
});
