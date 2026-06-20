import { jest } from "@jest/globals";

describe("AnalyticsService", () => {
  let AnalyticsService, service;

  beforeEach(async () => {
    jest.resetModules();

    const prismaMock = {
      event: { findUnique: jest.fn() },
      invitation: { groupBy: jest.fn() },
      comment: { count: jest.fn(), findMany: jest.fn() },
      like: { count: jest.fn(), findMany: jest.fn() },
      checkIn: { findMany: jest.fn() },
      media: { findMany: jest.fn() },
      memory: { findMany: jest.fn() },
    };

    const mod = await import("../../src/modules/analytics/analyticsService.js");
    AnalyticsService = mod.AnalyticsService;
    service = new AnalyticsService(prismaMock);
  });

  describe("getOverview", () => {
    it("should return full event stats", async () => {
      service.prisma.event.findUnique.mockResolvedValue({
        id: "e1", title: "Event", status: "COMPLETED",
        _count: { guests: 100, checkIns: 60, media: 200, memories: 30 },
      });
      service.prisma.invitation.groupBy.mockResolvedValue([
        { status: "ACCEPTED", _count: 40 },
        { status: "CHECKED_IN", _count: 60 },
        { status: "DECLINED", _count: 10 },
        { status: "PENDING", _count: 50 },
      ]);
      service.prisma.comment.count.mockResolvedValue(80);
      service.prisma.like.count.mockResolvedValue(150);

      const result = await service.getOverview("e1");
      expect(result.totalGuests).toBe(100);
      expect(result.totalCheckIns).toBe(60);
      expect(result.engagement.comments).toBe(80);
      expect(result.rsvpBreakdown.ACCEPTED).toBe(40);
    });

    it("should return null for unknown event", async () => {
      service.prisma.event.findUnique.mockResolvedValue(null);
      const result = await service.getOverview("bad-id");
      expect(result).toBeNull();
    });
  });

  describe("getDemographics", () => {
    it("should return RSVP breakdown with percentages", async () => {
      service.prisma.invitation.groupBy.mockResolvedValue([
        { status: "ACCEPTED", _count: 30 },
        { status: "DECLINED", _count: 10 },
      ]);

      const result = await service.getDemographics("e1");
      expect(result.total).toBe(40);
      expect(result.breakdown.ACCEPTED.percentage).toBe("75.0");
    });
  });

  describe("getEngagement", () => {
    it("should return engagement totals and timelines", async () => {
      const now = new Date();
      service.prisma.checkIn.findMany.mockResolvedValue([{ checkedAt: now }]);
      service.prisma.media.findMany.mockResolvedValue([{ createdAt: now }]);
      service.prisma.comment.findMany.mockResolvedValue([]);
      service.prisma.like.findMany.mockResolvedValue([]);
      service.prisma.memory.findMany.mockResolvedValue([]);

      const result = await service.getEngagement("e1");
      expect(result.totals.checkIns).toBe(1);
      expect(result.totals.mediaUploads).toBe(1);
      expect(result.timeline.checkIns).toHaveLength(1);
    });
  });
});
