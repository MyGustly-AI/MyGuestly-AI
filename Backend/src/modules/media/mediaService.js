import { AppError } from "../../shared/utils/AppError.js";

export class MediaService {
  constructor(prismaClient) {
    this.prisma = prismaClient;
  }

  async createMedia({ eventId, uploaderId, mediaType, url, publicId, caption }) {
    let resolvedPublicId = publicId || "unknown";
    if (!publicId && url.includes("cloudinary.com")) {
      try {
        const uploadIndex = url.indexOf("/upload/");
        if (uploadIndex !== -1) {
          let path = url.substring(uploadIndex + 8);
          if (path.match(/^v\d+\//)) path = path.replace(/^v\d+\//, "");
          const lastDot = path.lastIndexOf(".");
          if (lastDot !== -1) path = path.substring(0, lastDot);
          resolvedPublicId = path;
        }
      } catch (e) {
        resolvedPublicId = "unknown";
      }
    }

    const media = await this.prisma.media.create({
      data: {
        eventId,
        uploaderId,
        mediaType,
        url,
        publicId: resolvedPublicId,
        metadata: caption ? { caption } : {},
      },
    });

    return media;
  }

  async getMediaGallery(eventId, filters, skip, take) {
    const where = { eventId };
    if (filters.mediaType) where.mediaType = filters.mediaType;

    const [data, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          uploader: {
            select: { id: true, fullName: true, avatarUrl: true }
          },
          _count: {
            select: { comments: true, likes: true }
          }
        }
      }),
      this.prisma.media.count({ where }),
    ]);

    return { data, total };
  }

  async addComment(mediaId, userId, content) {
    const media = await this.prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) throw AppError.notFound("Media not found");

    const comment = await this.prisma.comment.create({
      data: {
        content,
        mediaId,
        authorId: userId,
      },
      include: {
        author: { select: { id: true, fullName: true, avatarUrl: true } }
      }
    });

    return comment;
  }

  async toggleLike(mediaId, userId) {
    const media = await this.prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) throw AppError.notFound("Media not found");

    const existingLike = await this.prisma.like.findUnique({
      where: { mediaId_userId: { mediaId, userId } }
    });

    if (existingLike) {
      await this.prisma.like.delete({ where: { id: existingLike.id } });
      return { liked: false };
    } else {
      await this.prisma.like.create({
        data: { mediaId, userId }
      });
      return { liked: true };
    }
  }

  async addVoiceNote(mediaId, voiceNoteUrl) {
    const media = await this.prisma.media.update({
      where: { id: mediaId },
      data: { voiceNoteUrl }
    });
    return media;
  }

  async getMedia(mediaId) {
    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
    });
    if (!media) throw AppError.notFound("Media not found");
    return media;
  }

  async deleteMedia(mediaId, userId) {
    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
    });
    if (!media) throw AppError.notFound("Media not found");

    const isOwner = media.uploaderId === userId;
    const isHost = await this.prisma.event.findUnique({
      where: { id: media.eventId },
    }).then(e => e?.hostId === userId);

    if (!isOwner && !isHost) {
      throw AppError.forbidden("You do not have permission to delete this media");
    }

    await this.prisma.media.update({
      where: { id: mediaId },
      data: { deletedAt: new Date() },
    });
    return true;
  }
}
