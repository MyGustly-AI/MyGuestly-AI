import { BaseController } from "../../shared/base/BaseController.js";
import { AIService } from "./aiService.js";
import { prisma } from "../../shared/utils/prisma.js";

class AIController extends BaseController {
  constructor() {
    super();
    this.aiService = new AIService(prisma);
  }

  getTimeline = this.asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const timeline = await this.aiService.getTimeline(eventId);
    return this.success(res, "Timeline retrieved", timeline);
  });

  retag = this.asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const result = await this.aiService.retagEvent(eventId);
    return this.accepted(res, "Retagging enqueued", result);
  });

  categorizeMedia = this.asyncHandler(async (req, res) => {
    const { mediaItems } = req.body;

    if (!mediaItems || !Array.isArray(mediaItems)) {
      return this.badRequest(res, "Please provide an array of mediaItems.");
    }

    const categorizedMoments = await this.aiService.organizeEventMoments(mediaItems);
    
    return this.success(res, "Media organized successfully", categorizedMoments);
  });
}

export default new AIController();
