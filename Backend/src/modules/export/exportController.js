import { BaseController } from "../../shared/base/BaseController.js";
import { ExportService } from "./exportService.js";
import { prisma } from "../../shared/utils/prisma.js";

class ExportController extends BaseController {
  constructor() {
    super();
    this.exportService = new ExportService(prisma);
  }

  guests = this.asyncHandler(async (req, res) => {
    const { csv, filename } = await this.exportService.exportGuests(req.params.eventId);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
  });

  checkIns = this.asyncHandler(async (req, res) => {
    const { csv, filename } = await this.exportService.exportCheckIns(req.params.eventId);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
  });
}

export default new ExportController();
