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
}

export default new AIController();
