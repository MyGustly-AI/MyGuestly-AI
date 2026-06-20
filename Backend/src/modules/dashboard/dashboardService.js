import { redis } from "../../config/redis.js";

const LIVE_CACHE_TTL = 30;

export class DashboardService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async getOverview(hostId) {
    const events = await this.prisma.event.findMany({
      where: { hostId, deletedAt: null },
      include: {
        _count: { select: { guests: true, checkIns: true, media: true } },
      },
    });

    const now = new Date();
    const upcoming = events.filter((e) => new Date(e.startDate) > now);
    const active = events.filter((e) => e.status === "ONGOING");
    const totalGuests = events.reduce((sum, e) => sum + e._count.guests, 0);
    const totalCheckIns = events.reduce((sum, e) => sum + e._count.checkIns, 0);

    return {
      totalEvents: events.length,
      upcomingEvents: upcoming.length,
      activeEvents: active.length,
      totalGuests,
      totalCheckIns,
      events: events.map((e) => ({
        id: e.id,
        title: e.title,
        status: e.status,
        startDate: e.startDate,
        guestCount: e._count.guests,
        checkInCount: e._count.checkIns,
        mediaCount: e._count.media,
      })),
    };
  }

  async getLiveStats(eventId) {
    const cached = await redis.get(`event:${eventId}:stats`);
    if (cached) return JSON.parse(cached);

    const [checkedIn, totalGuests, mediaCount] = await Promise.all([
      this.prisma.checkIn.count({ where: { eventId } }),
      this.prisma.guest.count({ where: { eventId } }),
      this.prisma.media.count({ where: { eventId } }),
    ]);

    const result = { checkedIn, totalGuests, mediaCount };
    await redis.set(`event:${eventId}:stats`, JSON.stringify(result), "EX", LIVE_CACHE_TTL);
    return result;
  }
}
