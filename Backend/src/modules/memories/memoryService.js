import { AppError } from "../../shared/utils/AppError.js";

export class MemoryService {
  constructor(prismaClient) {
    this.prisma = prismaClient;
  }

  async createMemory(eventId, authorId, data) {
    const { content, type, mediaUrl } = data;
    
    // Default to TEXT if unsupported type passed
    let dbType = type;
    if (type !== "TEXT" && type !== "VOICE") {
      dbType = "TEXT";
    }

    const memory = await this.prisma.memory.create({
      data: {
        eventId,
        authorId,
        type: dbType,
        content: content || null,
        audioUrl: dbType === "VOICE" ? mediaUrl : null,
      },
      include: {
        author: {
          select: { id: true, fullName: true, avatarUrl: true }
        }
      }
    });

    return memory;
  }

  async getMemories(eventId, skip, take, type) {
    const where = { eventId };
    if (type && (type === "TEXT" || type === "VOICE")) {
      where.type = type;
    }

    const [data, total] = await Promise.all([
      this.prisma.memory.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: { id: true, fullName: true, avatarUrl: true }
          }
        }
      }),
      this.prisma.memory.count({ where }),
    ]);

    return { data, total };
  }
}
