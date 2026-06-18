import { jest } from "@jest/globals";

describe("DashboardService", () => {
  let DashboardService, service;
  let redisMock;

  beforeEach(async () => {
    jest.resetModules();

    redisMock = { get: jest.fn(), set: jest.fn(), del: jest.fn() };
    jest.unstable_mockModule("../../src/config/redis.js", () => ({ redis: redisMock }));

    const prismaMock = {
      event: { findMany: jest.fn(), findUnique: jest.fn() },
      checkIn: { count: jest.fn() },
      guest: { count: jest.fn() },
      media: { count: jest.fn() },
    };

    const mod = await import("../../src/modules/dashboard/dashboardService.js");
    DashboardService = mod.DashboardService;
    service = new DashboardService(prismaMock);
  });

  describe("getOverview", () => {
    it("should return host overview stats", async () => {
      const now = new Date();
      const futureDate = new Date(now.getTime() + 86400000);
      service.prisma.event.findMany.mockResolvedValue([
        { id: "e1", title: "Event 1", status: "UPCOMING", startDate: futureDate, endDate: futureDate, hostId: "user-1", _count: { guests: 50, checkIns: 20, media: 100 } },
        { id: "e2", title: "Event 2", status: "ONGOING", startDate: now, endDate: now, hostId: "user-1", _count: { guests: 30, checkIns: 15, media: 50 } },
      ]);

      const result = await service.getOverview("user-1");
      expect(result.totalEvents).toBe(2);
      expect(result.upcomingEvents).toBe(1);
      expect(result.activeEvents).toBe(1);
      expect(result.totalGuests).toBe(80);
      expect(result.totalCheckIns).toBe(35);
    });
  });

  describe("getLiveStats", () => {
    it("should return live stats from cache when available", async () => {
      redisMock.get.mockResolvedValue(JSON.stringify({ checkedIn: 10, totalGuests: 50, mediaCount: 30 }));

      const result = await service.getLiveStats("event-1");
      expect(result.checkedIn).toBe(10);
      expect(service.prisma.checkIn.count).not.toHaveBeenCalled();
    });

    it("should query DB and cache on miss", async () => {
      redisMock.get.mockResolvedValue(null);
      service.prisma.checkIn.count.mockResolvedValue(10);
      service.prisma.guest.count.mockResolvedValue(50);
      service.prisma.media.count.mockResolvedValue(30);

      const result = await service.getLiveStats("event-1");
      expect(result.checkedIn).toBe(10);
      expect(result.totalGuests).toBe(50);
      expect(result.mediaCount).toBe(30);
    });
  });
});
