import { jest } from "@jest/globals";

describe("FeedbackService", () => {
  let FeedbackService, service;

  beforeEach(async () => {
    jest.resetModules();

    const prismaMock = {
      event: { findUnique: jest.fn() },
      feedback: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), count: jest.fn() },
    };

    const mod = await import("../../src/modules/feedback/feedbackService.js");
    FeedbackService = mod.FeedbackService;
    service = new FeedbackService(prismaMock);
  });

  describe("submit", () => {
    it("should create feedback when event exists and no duplicate", async () => {
      service.prisma.event.findUnique.mockResolvedValue({ id: "e1" });
      service.prisma.feedback.findUnique.mockResolvedValue(null);
      service.prisma.feedback.create.mockResolvedValue({ id: "f1", eventId: "e1", guestId: "g1", rating: 5 });

      const result = await service.submit("e1", "g1", { rating: 5, category: "GENERAL" });
      expect(result.rating).toBe(5);
    });

    it("should throw if event not found", async () => {
      service.prisma.event.findUnique.mockResolvedValue(null);
      await expect(service.submit("bad-id", "g1", { rating: 5 })).rejects.toThrow("Event not found");
    });

    it("should throw if duplicate feedback", async () => {
      service.prisma.event.findUnique.mockResolvedValue({ id: "e1" });
      service.prisma.feedback.findUnique.mockResolvedValue({ id: "existing" });
      await expect(service.submit("e1", "g1", { rating: 5 })).rejects.toThrow("already submitted feedback");
    });
  });

  describe("list", () => {
    it("should return paginated feedback", async () => {
      service.prisma.feedback.findMany.mockResolvedValue([{ id: "f1", comment: "Great!", guest: {} }]);
      service.prisma.feedback.count.mockResolvedValue(1);

      const result = await service.list("e1", 0, 20);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe("getSummary", () => {
    it("should return aggregated ratings", async () => {
      service.prisma.feedback.findMany.mockResolvedValue([
        { rating: 5, category: "GENERAL" },
        { rating: 4, category: "GENERAL" },
        { rating: 3, category: "VENUE" },
      ]);

      const result = await service.getSummary("e1");
      expect(result.total).toBe(3);
      expect(result.averageRating).toBe("4.0");
      expect(result.categoryBreakdown.GENERAL.count).toBe(2);
      expect(result.categoryBreakdown.VENUE.averageRating).toBe("3.0");
    });

    it("should return empty summary when no feedback", async () => {
      service.prisma.feedback.findMany.mockResolvedValue([]);
      const result = await service.getSummary("e1");
      expect(result.total).toBe(0);
      expect(result.averageRating).toBe(0);
    });
  });
});
