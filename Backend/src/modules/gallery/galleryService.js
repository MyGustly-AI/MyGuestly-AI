export class GalleryService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async getEventByCode(eventCode) {
    return this.prisma.event.findUnique({
      where: { eventCode },
      select: { id: true, title: true, description: true, coverUrl: true, startDate: true, endDate: true, venueName: true },
    });
  }

  async listMedia(eventCode, skip = 0, take = 50) {
    const event = await this.prisma.event.findUnique({
      where: { eventCode },
      select: { id: true },
    });
    if (!event) return null;

    const [data, total] = await Promise.all([
      this.prisma.media.findMany({
        where: { eventId: event.id, status: "READY", deletedAt: null },
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          url: true,
          mediaType: true,
          width: true,
          height: true,
          createdAt: true,
          tags: { select: { label: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      this.prisma.media.count({ where: { eventId: event.id, status: "READY", deletedAt: null } }),
    ]);

    return {
      event,
      data,
      total,
    };
  }

  async getMedia(eventCode, mediaId) {
    const event = await this.prisma.event.findUnique({
      where: { eventCode },
      select: { id: true, title: true },
    });
    if (!event) return null;

    const media = await this.prisma.media.findFirst({
      where: { id: mediaId, eventId: event.id, deletedAt: null },
      select: {
        id: true,
        url: true,
        mediaType: true,
        width: true,
        height: true,
        duration: true,
        createdAt: true,
        tags: { select: { label: true } },
        uploader: { select: { fullName: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
        comments: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: { select: { fullName: true, avatarUrl: true } },
          },
        },
      },
    });

    return { event, media };
  }
}
