import { jest } from "@jest/globals";

describe("InvitationService", () => {
  let InvitationService, service;

  beforeEach(async () => {
    jest.resetModules();

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
      invitation: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
      event: { findUnique: jest.fn() },
      guest: { findUnique: jest.fn(), create: jest.fn() },
      qRCode: { create: jest.fn() },
    };

    jest.unstable_mockModule("../../src/infra/loggers/logger.js", () => ({
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    }));

    jest.unstable_mockModule("../../src/shared/utils/AppError.js", () => {
      class AppError extends Error {
        constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
        static notFound(msg) { return new AppError(msg, 404); }
        static forbidden(msg) { return new AppError(msg, 403); }
        static badRequest(msg) { return new AppError(msg, 400); }
        static conflict(msg) { return new AppError(msg, 409); }
        static unauthorized(msg) { return new AppError(msg, 401); }
      }
      return { AppError };
    });

    jest.unstable_mockModule("../../src/shared/utils/qrUtils.js", () => ({
      QrUtils: { signQRToken: jest.fn().mockReturnValue("mock-qr-token") },
    }));

    const mod = await import("../../src/modules/invitations/invitationService.js");
    InvitationService = mod.InvitationService;
    service = new InvitationService(prismaMock);
  });

  describe("getInvitation", () => {
    it("should return invitation by id", async () => {
      service.prisma.invitation.findUnique.mockResolvedValue({
        id: "inv-1", status: "PENDING", guest: { id: "g-1", fullName: "G", email: "g@t.com", phone: null },
        event: { id: "e-1", title: "E", eventCode: "EC", startDate: new Date(), endDate: new Date(), host: {} },
      });

      const result = await service.getInvitation("inv-1");
      expect(result.id).toBe("inv-1");
    });

    it("should throw if not found", async () => {
      service.prisma.invitation.findUnique.mockResolvedValue(null);
      await expect(service.getInvitation("bad-id")).rejects.toThrow("Invitation not found");
    });
  });

  describe("rsvp", () => {
    it("should update invitation status on RSVP", async () => {
      service.prisma.invitation.findUnique.mockResolvedValue({ id: "inv-1", token: "tok-1", status: "PENDING" });
      service.prisma.invitation.update.mockResolvedValue({ id: "inv-1", status: "ACCEPTED" });

      const result = await service.rsvp("tok-1", "YES");
      expect(result.status).toBe("ACCEPTED");
    });

    it("should throw if already checked in", async () => {
      service.prisma.invitation.findUnique.mockResolvedValue({ id: "inv-1", token: "tok-1", status: "CHECKED_IN" });
      await expect(service.rsvp("tok-1", "NO")).rejects.toThrow("Cannot change RSVP after check-in");
    });
  });

  describe("resendInvitation", () => {
    it("should queue a resend and update sentAt", async () => {
      service.prisma.invitation.findUnique.mockResolvedValue({
        id: "inv-1", token: "tok-1", status: "PENDING",
        guest: { id: "g-1", email: "g@t.com" },
        event: { id: "e-1", title: "E", eventCode: "EC", startDate: new Date(), endDate: new Date() },
      });
      service.prisma.invitation.update.mockResolvedValue({ id: "inv-1", sentAt: new Date() });

      const result = await service.resendInvitation("inv-1");
      expect(result).toBe(true);
    }, 30000);
  });
});
