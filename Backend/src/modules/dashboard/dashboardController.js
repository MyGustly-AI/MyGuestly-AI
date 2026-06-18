import { BaseController } from "../../shared/base/BaseController.js";
import { DashboardService } from "./dashboardService.js";
import { prisma } from "../../shared/utils/prisma.js";

class DashboardController extends BaseController {
  constructor() {
    super();
    this.dashboardService = new DashboardService(prisma);
  }

  overview = this.asyncHandler(async (req, res) => {
    const data = await this.dashboardService.getOverview(req.user.id);
    return this.success(res, "Dashboard overview retrieved", data);
  });

  liveStats = this.asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const data = await this.dashboardService.getLiveStats(eventId);
    return this.success(res, "Live stats retrieved", data);
  });
}

export default new DashboardController();
