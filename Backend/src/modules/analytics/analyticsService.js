export class AnalyticsService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async getOverview(eventId) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: { select: { guests: true, checkIns: true, media: true, memories: true } },
      },
    });
    if (!event) return null;

    const rsvpCounts = await this.prisma.invitation.groupBy({
      by: ["status"],
      where: { eventId },
      _count: true,
    });

    const rsvpBreakdown = { PENDING: 0, ACCEPTED: 0, DECLINED: 0, CHECKED_IN: 0 };
    for (const r of rsvpCounts) {
      rsvpBreakdown[r.status] = r._count;
    }

    const totalComments = await this.prisma.comment.count({
      where: { media: { eventId }, deletedAt: null },
    });
    const totalLikes = await this.prisma.like.count({
      where: { media: { eventId } },
    });

    return {
      eventId,
      title: event.title,
      status: event.status,
      totalGuests: event._count.guests,
      totalCheckIns: event._count.checkIns,
      totalMedia: event._count.media,
      totalMemories: event._count.memories,
      rsvpBreakdown,
      engagement: {
        comments: totalComments,
        likes: totalLikes,
      },
    };
  }

  async getDemographics(eventId) {
    const rsvpGroups = await this.prisma.invitation.groupBy({
      by: ["status"],
      where: { eventId },
      _count: true,
    });

    const total = rsvpGroups.reduce((s, g) => s + g._count, 0);
    const data = {};
    for (const g of rsvpGroups) {
      data[g.status] = { count: g._count, percentage: total ? ((g._count / total) * 100).toFixed(1) : "0" };
    }
    return { total, breakdown: data };
  }

  async getEngagement(eventId) {
    const [checkIns, mediaUploads, comments, likes, memories] = await Promise.all([
      this.prisma.checkIn.findMany({ where: { eventId }, select: { checkedAt: true }, orderBy: { checkedAt: "asc" } }),
      this.prisma.media.findMany({ where: { eventId, deletedAt: null }, select: { createdAt: true }, orderBy: { createdAt: "asc" } }),
      this.prisma.comment.findMany({ where: { media: { eventId }, deletedAt: null }, select: { createdAt: true }, orderBy: { createdAt: "asc" } }),
      this.prisma.like.findMany({ where: { media: { eventId } }, select: { createdAt: true }, orderBy: { createdAt: "asc" } }),
      this.prisma.memory.findMany({ where: { eventId, deletedAt: null }, select: { createdAt: true }, orderBy: { createdAt: "asc" } }),
    ]);

    return {
      totals: {
        checkIns: checkIns.length,
        mediaUploads: mediaUploads.length,
        comments: comments.length,
        likes: likes.length,
        memories: memories.length,
      },
      timeline: {
        checkIns: checkIns.map((c) => c.checkedAt),
        mediaUploads: mediaUploads.map((m) => m.createdAt),
        comments: comments.map((c) => c.createdAt),
        likes: likes.map((l) => l.createdAt),
        memories: memories.map((m) => m.createdAt),
      },
    };
  }
}
