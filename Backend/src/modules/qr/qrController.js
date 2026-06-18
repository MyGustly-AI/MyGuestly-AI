import { BaseController } from "../../shared/base/BaseController.js";
import { QRService } from "./qrService.js";
import { prisma } from "../../shared/utils/prisma.js";

class QRController extends BaseController {
  constructor() {
    super();
    this.qrService = new QRService(prisma);
  }

  scan = this.asyncHandler(async (req, res) => {
    const { token, eventId } = req.body;
    const result = await this.qrService.scan(token, eventId, req.user?.id);
    return this.success(res, "Check-in successful", result);
  });

  listCheckins = this.asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { page, limit, skip } = this.getPaginationParams(req);
    const { data, total } = await this.qrService.listCheckins(eventId, skip, limit);
    return this.paginated(res, data, page, limit, total, "Check-ins retrieved");
  });

  liveCount = this.asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const stats = await this.qrService.liveCount(eventId);
    return this.success(res, "Live check-in count", stats);
  });
}

export default new QRController();
