import { AppError } from "../../shared/utils/AppError.js";
import { redis } from "../../config/redis.js";

const LIKES_CACHE_TTL = 60;

export class SocialService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async addComment(mediaId, userId, content) {
    const media = await this.prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) throw AppError.notFound("Media not found");

    return this.prisma.comment.create({
      data: { mediaId, authorId: userId, content },
      include: { author: { select: { id: true, fullName: true, avatarUrl: true } } },
    });
  }

  async listComments(mediaId, skip = 0, take = 20) {
    const [data, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { mediaId, deletedAt: null },
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { author: { select: { id: true, fullName: true, avatarUrl: true } } },
      }),
      this.prisma.comment.count({ where: { mediaId, deletedAt: null } }),
    ]);
    return { data, total };
  }

  async deleteComment(commentId, userId) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw AppError.notFound("Comment not found");
    if (comment.authorId !== userId) throw AppError.forbidden("Not your comment");
    await this.prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });
    return true;
  }

  async toggleLike(mediaId, userId) {
    const existing = await this.prisma.like.findUnique({
      where: { mediaId_userId: { mediaId, userId } },
    });

    if (existing) {
      await this.prisma.like.delete({ where: { id: existing.id } });
      await redis.del(`media:${mediaId}:likes`);
      return { liked: false };
    }

    await this.prisma.like.create({
      data: { mediaId, userId },
    });
    await redis.del(`media:${mediaId}:likes`);
    return { liked: true };
  }

  async getLikeCount(mediaId) {
    const cached = await redis.get(`media:${mediaId}:likes`);
    if (cached) return JSON.parse(cached);

    const count = await this.prisma.like.count({ where: { mediaId } });
    const result = { count };
    await redis.set(`media:${mediaId}:likes`, JSON.stringify(result), "EX", LIKES_CACHE_TTL);
    return result;
  }
}
