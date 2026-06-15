import { jest } from "@jest/globals";

describe("GalleryService", () => {
  let GalleryService, service;

  beforeEach(async () => {
    jest.resetModules();

    const prismaMock = {
      event: { findUnique: jest.fn() },
      media: { findMany: jest.fn(), findFirst: jest.fn(), count: jest.fn() },
    };

    const mod = await import("../../src/modules/gallery/galleryService.js");
    GalleryService = mod.GalleryService;
    service = new GalleryService(prismaMock);
  });

  describe("listMedia", () => {
    it("should return public media list for valid eventCode", async () => {
      service.prisma.event.findUnique.mockResolvedValue({ id: "e1" });
      service.prisma.media.findMany.mockResolvedValue([{ id: "m1", url: "url", mediaType: "IMAGE", tags: [], _count: { likes: 0, comments: 0 } }]);
      service.prisma.media.count.mockResolvedValue(1);

      const result = await service.listMedia("event-code", 0, 50);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it("should return null for unknown eventCode", async () => {
      service.prisma.event.findUnique.mockResolvedValue(null);
      const result = await service.listMedia("bad-code", 0, 50);
      expect(result).toBeNull();
    });
  });

  describe("getMedia", () => {
    it("should return single media with event info", async () => {
      service.prisma.event.findUnique.mockResolvedValue({ id: "e1", title: "Event" });
      service.prisma.media.findFirst.mockResolvedValue({ id: "m1", url: "url", uploader: {}, _count: {}, comments: [] });

      const result = await service.getMedia("event-code", "m1");
      expect(result.event.title).toBe("Event");
      expect(result.media.id).toBe("m1");
    });
  });
});
