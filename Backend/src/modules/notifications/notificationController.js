import { BaseController } from "../../shared/base/BaseController.js";
import { NotificationService } from "./notificationService.js";
import { prisma } from "../../shared/utils/prisma.js";

class NotificationController extends BaseController {
  constructor() {
    super();
    this.notificationService = new NotificationService(prisma);
  }

  list = this.asyncHandler(async (req, res) => {
    const { page, limit, skip } = this.getPaginationParams(req);
    const { data, total } = await this.notificationService.list(req.user.id, skip, limit);
    return this.paginated(res, data, page, limit, total, "Notifications retrieved");
  });

  markAsRead = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    await this.notificationService.markAsRead(id, req.user.id);
    return this.success(res, "Notification marked as read");
  });

  markAllAsRead = this.asyncHandler(async (req, res) => {
    await this.notificationService.markAllAsRead(req.user.id);
    return this.success(res, "All notifications marked as read");
  });
}

export default new NotificationController();
