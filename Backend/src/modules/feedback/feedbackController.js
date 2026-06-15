import { BaseController } from "../../shared/base/BaseController.js";
import { FeedbackService } from "./feedbackService.js";
import { prisma } from "../../shared/utils/prisma.js";

class FeedbackController extends BaseController {
  constructor() {
    super();
    this.feedbackService = new FeedbackService(prisma);
  }

  submit = this.asyncHandler(async (req, res) => {
    const { guestId } = req.body;
    const feedback = await this.feedbackService.submit(req.params.eventId, guestId, req.body);
    return this.created(res, "Feedback submitted", feedback);
  });

  list = this.asyncHandler(async (req, res) => {
    const { page, limit, skip } = this.getPaginationParams(req);
    const { data, total } = await this.feedbackService.list(req.params.eventId, skip, limit);
    return this.paginated(res, data, page, limit, total, "Feedback retrieved");
  });

  summary = this.asyncHandler(async (req, res) => {
    const data = await this.feedbackService.getSummary(req.params.eventId);
    return this.success(res, "Feedback summary retrieved", data);
  });
}

export default new FeedbackController();
