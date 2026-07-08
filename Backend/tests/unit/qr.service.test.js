import { jest } from "@jest/globals";

describe("QRService", () => {
  let QRService, QrUtils, service;

  beforeEach(async () => {
    jest.resetModules();

    jest.unstable_mockModule("../../src/shared/utils/qrUtils.js", () => ({
      QrUtils: { verifyQRToken: jest.fn(), generateQRToken: jest.fn() },
    }));

    jest.unstable_mockModule("../../src/config/redis.js", () => ({
      redis: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
    }));

    jest.unstable_mockModule("../../src/infra/loggers/logger.js", () => ({
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    }));

    const qrUtilsMod = await import("../../src/shared/utils/qrUtils.js");
    QrUtils = qrUtilsMod.QrUtils;

    const prismaMock = {
      checkIn: { findMany: jest.fn(), count: jest.fn(), create: jest.fn() },
      invitation: { findUnique: jest.fn(), update: jest.fn() },
    };

    const mod = await import("../../src/modules/qr/qrService.js");
    QRService = mod.QRService;
    service = new QRService(prismaMock);
  });

  describe("scan", () => {
    it("should reject invalid token", async () => {
      QrUtils.verifyQRToken.mockReturnValue(null);
      await expect(service.scan("bad-token", "event-1", "user-1")).rejects.toThrow("Invalid or expired QR code");
    });

    it("should scan successfully with valid token", async () => {
      QrUtils.verifyQRToken.mockReturnValue({ invitationId: "inv-1", eventId: "event-1" });
      const { redis } = await import("../../src/config/redis.js");
      redis.set.mockResolvedValue("OK");
      service.prisma.invitation.findUnique.mockResolvedValue({
        id: "inv-1", guestId: "guest-1", eventId: "event-1", status: "SENT",
        guest: { id: "guest-1", fullName: "John" },
      });
      service.prisma.checkIn.create.mockResolvedValue({ id: "ci-1", eventId: "event-1", guestId: "guest-1" });
      service.prisma.invitation.update.mockResolvedValue({ id: "inv-1", status: "CHECKED_IN" });

      const result = await service.scan("valid-token", "event-1", "user-1");
      expect(result).toHaveProperty("checkIn");
      expect(result).toHaveProperty("guest");
    });
  });

  describe("listCheckins", () => {
    it("should return paginated check-ins", async () => {
      service.prisma.checkIn.findMany.mockResolvedValue([{ id: "ci-1" }]);
      service.prisma.checkIn.count.mockResolvedValue(1);

      const result = await service.listCheckins("event-1", 0, 20);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });
});
