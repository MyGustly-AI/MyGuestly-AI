import { BaseController } from "../../shared/base/BaseController.js";
import { MemoryService } from "./memoryService.js";
import { prisma } from "../../shared/utils/prisma.js";
import { AppError } from "../../shared/utils/AppError.js";

class MemoryController extends BaseController {
  constructor() {
    super();
    this.memoryService = new MemoryService(prisma);
  }

  /**
   * POST /events/:eventId/memories
   * Add a text or voice memory
   */
  addMemory = this.asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const authorId = req.user.id;
    const data = req.body;

    const memory = await this.memoryService.createMemory(eventId, authorId, data);
    this.created(res, "Memory added successfully", memory);
  });

  /**
   * GET /events/:eventId/memories
   * List memory feed
   */
  listMemories = this.asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { page, limit, skip } = this.getPaginationParams(req);
    const { type } = req.validatedQuery || {};

    const { data, total } = await this.memoryService.getMemories(eventId, skip, limit, type);
    this.paginated(res, data, page, limit, total, "Memories retrieved");
  });
}

export default new MemoryController();
