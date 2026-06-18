import { jest } from "@jest/globals";

describe("SocialService", () => {
  let SocialService, service;
  let redisMock;

  beforeEach(async () => {
    jest.resetModules();

    redisMock = { get: jest.fn(), set: jest.fn(), del: jest.fn() };
    jest.unstable_mockModule("../../src/config/redis.js", () => ({ redis: redisMock }));

    const prismaMock = {
      media: { findUnique: jest.fn() },
      comment: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
      like: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), delete: jest.fn(), count: jest.fn() },
    };

    const mod = await import("../../src/modules/social/socialService.js");
    SocialService = mod.SocialService;
    service = new SocialService(prismaMock);
  });

  describe("addComment", () => {
    it("should create a comment on existing media", async () => {
      service.prisma.media.findUnique.mockResolvedValue({ id: "media-1" });
      const comment = { id: "c1", mediaId: "media-1", authorId: "user-1", content: "Nice!", author: { id: "user-1", fullName: "Test", avatarUrl: null } };
      service.prisma.comment.create.mockResolvedValue(comment);

      const result = await service.addComment("media-1", "user-1", "Nice!");
      expect(result.content).toBe("Nice!");
    });

    it("should throw if media not found", async () => {
      service.prisma.media.findUnique.mockResolvedValue(null);
      await expect(service.addComment("bad-id", "user-1", "Hi")).rejects.toThrow("Media not found");
    });
  });

  describe("listComments", () => {
    it("should return paginated comments", async () => {
      service.prisma.comment.findMany.mockResolvedValue([{ id: "c1", content: "Nice!", author: {} }]);
      service.prisma.comment.count.mockResolvedValue(1);

      const result = await service.listComments("media-1", 0, 20);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe("deleteComment", () => {
    it("should soft-delete own comment", async () => {
      service.prisma.comment.findUnique.mockResolvedValue({ id: "c1", authorId: "user-1", deletedAt: null });
      service.prisma.comment.update.mockResolvedValue({ id: "c1", deletedAt: new Date() });

      await service.deleteComment("c1", "user-1");
      expect(service.prisma.comment.update).toHaveBeenCalled();
    });

    it("should throw if not own comment", async () => {
      service.prisma.comment.findUnique.mockResolvedValue({ id: "c1", authorId: "other-user" });
      await expect(service.deleteComment("c1", "user-1")).rejects.toThrow("Not your comment");
    });
  });

  describe("toggleLike", () => {
    it("should like when not already liked", async () => {
      service.prisma.like.findUnique.mockResolvedValue(null);
      service.prisma.like.create.mockResolvedValue({ id: "l1" });

      const result = await service.toggleLike("media-1", "user-1");
      expect(result.liked).toBe(true);
      expect(redisMock.del).toHaveBeenCalled();
    });

    it("should unlike when already liked", async () => {
      service.prisma.like.findUnique.mockResolvedValue({ id: "l1", mediaId: "media-1", userId: "user-1" });

      const result = await service.toggleLike("media-1", "user-1");
      expect(result.liked).toBe(false);
    });
  });

  describe("getLikeCount", () => {
    it("should return cached count if available", async () => {
      redisMock.get.mockResolvedValue(JSON.stringify({ count: 42 }));

      const result = await service.getLikeCount("media-1");
      expect(result.count).toBe(42);
      expect(service.prisma.like.count).not.toHaveBeenCalled();
    });

    it("should query DB and cache on miss", async () => {
      redisMock.get.mockResolvedValue(null);
      service.prisma.like.count.mockResolvedValue(5);

      const result = await service.getLikeCount("media-1");
      expect(result.count).toBe(5);
      expect(redisMock.set).toHaveBeenCalled();
    });
  });
});
