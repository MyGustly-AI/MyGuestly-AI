import { jest } from "@jest/globals";

describe("ExportService", () => {
  let ExportService, service;

  beforeEach(async () => {
    jest.resetModules();

    const prismaMock = {
      guest: { findMany: jest.fn() },
      checkIn: { findMany: jest.fn() },
    };

    const mod = await import("../../src/modules/export/exportService.js");
    ExportService = mod.ExportService;
    service = new ExportService(prismaMock);
  });

  describe("exportGuests", () => {
    it("should generate CSV from guest data", async () => {
      service.prisma.guest.findMany.mockResolvedValue([
        { id: "g1", fullName: "Alice", email: "a@t.com", phone: "123", invitation: { status: "ACCEPTED", rsvpAt: new Date(), sentAt: new Date() }, checkIn: { checkedAt: new Date() } },
        { id: "g2", fullName: "Bob", email: "", phone: null, invitation: null, checkIn: null },
      ]);

      const { csv, filename } = await service.exportGuests("e1");
      expect(filename).toContain("guests");
      expect(csv).toContain("fullName");
      expect(csv).toContain("Alice");
      expect(csv).toContain("Bob");
      expect(csv).toContain("NO_INVITATION");
    });
  });

  describe("exportCheckIns", () => {
    it("should generate CSV from check-in data", async () => {
      service.prisma.checkIn.findMany.mockResolvedValue([
        { id: "c1", guestId: "g1", guest: { fullName: "Alice", email: "a@t.com", phone: "123" }, checkedAt: new Date() },
      ]);

      const { csv, filename } = await service.exportCheckIns("e1");
      expect(filename).toContain("checkins");
      expect(csv).toContain("Alice");
    });
  });
});
