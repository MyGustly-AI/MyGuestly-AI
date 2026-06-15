export class NotificationService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async list(userId, skip = 0, take = 20) {
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId, deletedAt: null },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.notification.count({ where: { userId, deletedAt: null } }),
    ]);
    return { data, total };
  }

  async markAsRead(notificationId, userId) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false, deletedAt: null },
      data: { isRead: true },
    });
  }

  async create(data) {
    return this.prisma.notification.create({ data });
  }
}
