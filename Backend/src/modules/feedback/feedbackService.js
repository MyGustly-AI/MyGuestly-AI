import { AppError } from "../../shared/utils/AppError.js";

export class FeedbackService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async submit(eventId, guestId, data) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw AppError.notFound("Event not found");

    const existing = await this.prisma.feedback.findUnique({
      where: { eventId_guestId: { eventId, guestId } },
    });
    if (existing) throw AppError.conflict("You have already submitted feedback for this event");

    return this.prisma.feedback.create({
      data: {
        eventId,
        guestId,
        rating: data.rating,
        comment: data.comment,
        category: data.category,
      },
    });
  }

  async list(eventId, skip = 0, take = 20) {
    const [data, total] = await Promise.all([
      this.prisma.feedback.findMany({
        where: { eventId, deletedAt: null },
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { guest: { select: { id: true, fullName: true, avatarUrl: true } } },
      }),
      this.prisma.feedback.count({ where: { eventId, deletedAt: null } }),
    ]);
    return { data, total };
  }

  async getSummary(eventId) {
    const feedbacks = await this.prisma.feedback.findMany({
      where: { eventId, deletedAt: null },
      select: { rating: true, category: true },
    });

    if (feedbacks.length === 0) {
      return { total: 0, averageRating: 0, categoryBreakdown: {} };
    }

    const totalRating = feedbacks.reduce((s, f) => s + f.rating, 0);
    const categoryBreakdown = {};
    for (const f of feedbacks) {
      if (!categoryBreakdown[f.category]) {
        categoryBreakdown[f.category] = { count: 0, totalRating: 0 };
      }
      categoryBreakdown[f.category].count++;
      categoryBreakdown[f.category].totalRating += f.rating;
    }

    for (const cat of Object.keys(categoryBreakdown)) {
      categoryBreakdown[cat].averageRating = (categoryBreakdown[cat].totalRating / categoryBreakdown[cat].count).toFixed(1);
    }

    return {
      total: feedbacks.length,
      averageRating: (totalRating / feedbacks.length).toFixed(1),
      categoryBreakdown,
    };
  }
}
