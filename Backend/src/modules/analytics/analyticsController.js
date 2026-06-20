import { BaseController } from "../../shared/base/BaseController.js";
import { AnalyticsService } from "./analyticsService.js";
import { prisma } from "../../shared/utils/prisma.js";

class AnalyticsController extends BaseController {
  constructor() {
    super();
    this.analyticsService = new AnalyticsService(prisma);
  }

  overview = this.asyncHandler(async (req, res) => {
    const data = await this.analyticsService.getOverview(req.params.eventId);
    if (!data) return this.notFound(res, "Event not found");
    return this.success(res, "Analytics overview retrieved", data);
  });

  demographics = this.asyncHandler(async (req, res) => {
    const data = await this.analyticsService.getDemographics(req.params.eventId);
    return this.success(res, "Demographics retrieved", data);
  });

  engagement = this.asyncHandler(async (req, res) => {
    const data = await this.analyticsService.getEngagement(req.params.eventId);
    return this.success(res, "Engagement data retrieved", data);
  });
}

export default new AnalyticsController();
