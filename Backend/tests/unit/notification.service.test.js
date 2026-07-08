import { jest } from "@jest/globals";

describe("NotificationService", () => {
  let NotificationService;
  let service;
  let prismaMock;

  beforeEach(async () => {
    jest.resetModules();

    prismaMock = {
      notification: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        updateMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const mod = await import("../../src/modules/notifications/notificationService.js");
    NotificationService = mod.NotificationService;
    service = new NotificationService(prismaMock);
  });

  describe("list", () => {
    it("should return paginated notifications", async () => {
      prismaMock.notification.findMany.mockResolvedValue([{ id: "n1", title: "Check-in", isRead: false }]);
      prismaMock.notification.count.mockResolvedValue(1);

      const result = await service.list("user-1", 0, 20);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe("markAsRead", () => {
    it("should mark a notification as read", async () => {
      prismaMock.notification.updateMany.mockResolvedValue({ count: 1 });

      await service.markAsRead("n1", "user-1");
      expect(prismaMock.notification.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "n1", userId: "user-1" },
          data: { isRead: true },
        }),
      );
    });
  });

  describe("markAllAsRead", () => {
    it("should mark all unread notifications as read", async () => {
      prismaMock.notification.updateMany.mockResolvedValue({ count: 3 });

      await service.markAllAsRead("user-1");
      expect(prismaMock.notification.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user-1", isRead: false, deletedAt: null },
        }),
      );
    });
  });

  describe("create", () => {
    it("should create a notification", async () => {
      const notif = { id: "n1", userId: "user-1", type: "CHECK_IN", title: "New check-in", body: "A guest checked in" };
      prismaMock.notification.create.mockResolvedValue(notif);

      const result = await service.create(notif);
      expect(result.title).toBe("New check-in");
    });
  });
});
