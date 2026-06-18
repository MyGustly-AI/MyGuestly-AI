import { jest } from "@jest/globals";

describe("MediaService", () => {
  let MediaService, service;
  let redisMock;

  beforeEach(async () => {
    jest.resetModules();

    const prismaMock = {
      media: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      event: { findUnique: jest.fn() },
    };

    jest.unstable_mockModule("../../src/shared/utils/AppError.js", () => {
      class AppError extends Error {
        constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
        static notFound(msg) { return new AppError(msg, 404); }
        static forbidden(msg) { return new AppError(msg, 403); }
      }
      return { AppError };
    });

    const mod = await import("../../src/modules/media/mediaService.js");
    MediaService = mod.MediaService;
    service = new MediaService(prismaMock);
  });

  describe("createMedia", () => {
    it("should create a media record", async () => {
      const data = { url: "https://res.cloudinary.com/test.jpg", publicId: "test/img", mediaType: "IMAGE", caption: "test" };
      const created = { id: "media-1", ...data, eventId: "event-1", uploaderId: "user-1" };
      service.prisma.media.create.mockResolvedValue(created);

      const result = await service.createMedia({ eventId: "event-1", uploaderId: "user-1", ...data });
      expect(result.id).toBe("media-1");
    });
  });

  describe("getMediaGallery", () => {
    it("should return paginated media for an event", async () => {
      service.prisma.media.findMany.mockResolvedValue([{ id: "media-1", tags: [], _count: { comments: 0, likes: 0 } }]);
      service.prisma.media.count.mockResolvedValue(1);

      const result = await service.getMediaGallery("event-1", {}, 0, 20);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe("getMedia", () => {
    it("should return media by id", async () => {
      const media = { id: "media-1", tags: [], comments: [], likes: [] };
      service.prisma.media.findUnique.mockResolvedValue(media);

      const result = await service.getMedia("media-1");
      expect(result.id).toBe("media-1");
    });

    it("should throw if not found", async () => {
      service.prisma.media.findUnique.mockResolvedValue(null);
      await expect(service.getMedia("bad-id")).rejects.toThrow("Media not found");
    });
  });

  describe("deleteMedia", () => {
    it("should soft-delete own media", async () => {
      service.prisma.media.findUnique.mockResolvedValue({ id: "media-1", uploaderId: "user-1", eventId: "event-1" });
      service.prisma.event.findUnique.mockResolvedValue({ id: "event-1", hostId: "other-host" });
      service.prisma.media.update.mockResolvedValue({ id: "media-1", deletedAt: new Date() });

      const result = await service.deleteMedia("media-1", "user-1");
      expect(result).toBe(true);
    });

    it("should allow host to delete any media", async () => {
      service.prisma.media.findUnique.mockResolvedValue({ id: "media-1", uploaderId: "other-user", eventId: "event-1" });
      service.prisma.event.findUnique.mockResolvedValue({ id: "event-1", hostId: "user-1" });
      service.prisma.media.update.mockResolvedValue({ id: "media-1", deletedAt: new Date() });

      const result = await service.deleteMedia("media-1", "user-1");
      expect(result).toBe(true);
    });
  });

  describe("addComment", () => {
    it("should add a comment to media", async () => {
      service.prisma.media.findUnique.mockResolvedValue({ id: "media-1" });
      service.prisma.comment = { create: jest.fn() };
      service.prisma.comment.create.mockResolvedValue({ id: "c1", content: "Nice!", mediaId: "media-1", authorId: "user-1" });

      const result = await service.addComment("media-1", "user-1", "Nice!");
      expect(result.content).toBe("Nice!");
    });
  });

  describe("toggleLike", () => {
    it("should like media if not already liked", async () => {
      service.prisma.media.findUnique.mockResolvedValue({ id: "media-1" });
      service.prisma.like = { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn() };
      service.prisma.like.findUnique.mockResolvedValue(null);

      const result = await service.toggleLike("media-1", "user-1");
      expect(result.liked).toBe(true);
    });
  });
});
