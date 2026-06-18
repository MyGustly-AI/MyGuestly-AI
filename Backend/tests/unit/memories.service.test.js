import { jest } from "@jest/globals";

describe("MemoryService", () => {
  let MemoryService, service;

  beforeEach(async () => {
    jest.resetModules();

    const prismaMock = {
      memory: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      event: { findUnique: jest.fn() },
    };

    const mod = await import("../../src/modules/memories/memoryService.js");
    MemoryService = mod.MemoryService;
    service = new MemoryService(prismaMock);
  });

  describe("createMemory", () => {
    it("should create a text memory", async () => {
      const created = { id: "mem-1", eventId: "event-1", authorId: "user-1", type: "TEXT", content: "Great wedding!", author: { id: "user-1", fullName: "Test", avatarUrl: null } };
      service.prisma.memory.create.mockResolvedValue(created);

      const result = await service.createMemory("event-1", "user-1", { content: "Great wedding!", type: "TEXT" });
      expect(result.type).toBe("TEXT");
      expect(result.content).toBe("Great wedding!");
    });

    it("should create a voice memory", async () => {
      const created = { id: "mem-1", eventId: "event-1", authorId: "user-1", type: "VOICE", audioUrl: "https://res.cloudinary.com/audio.mp3", author: {} };
      service.prisma.memory.create.mockResolvedValue(created);

      const result = await service.createMemory("event-1", "user-1", { mediaUrl: "https://res.cloudinary.com/audio.mp3", type: "VOICE" });
      expect(result.type).toBe("VOICE");
      expect(result.audioUrl).toBe("https://res.cloudinary.com/audio.mp3");
    });
  });

  describe("getMemories", () => {
    it("should return paginated memories with type filter", async () => {
      const memory = { id: "mem-1", eventId: "event-1", type: "TEXT", content: "Nice", author: {} };
      service.prisma.memory.findMany.mockResolvedValue([memory]);
      service.prisma.memory.count.mockResolvedValue(1);

      const result = await service.getMemories("event-1", 0, 20, "TEXT");
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(service.prisma.memory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: "TEXT" }),
        }),
      );
    });
  });

  describe("deleteMemory", () => {
    it("should soft-delete own memory", async () => {
      service.prisma.memory.findUnique.mockResolvedValue({ id: "mem-1", authorId: "user-1", eventId: "event-1" });
      service.prisma.event.findUnique.mockResolvedValue({ id: "event-1", hostId: "other-host" });
      service.prisma.memory.update.mockResolvedValue({ id: "mem-1", deletedAt: new Date() });

      const result = await service.deleteMemory("mem-1", "user-1");
      expect(result).toBe(true);
    });

    it("should throw if not found", async () => {
      service.prisma.memory.findUnique.mockResolvedValue(null);
      await expect(service.deleteMemory("bad-id", "user-1")).rejects.toThrow("Memory not found");
    });
  });
});
