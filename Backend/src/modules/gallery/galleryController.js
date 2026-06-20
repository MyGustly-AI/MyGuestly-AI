import { BaseController } from "../../shared/base/BaseController.js";
import { GalleryService } from "./galleryService.js";
import { prisma } from "../../shared/utils/prisma.js";

class GalleryController extends BaseController {
  constructor() {
    super();
    this.galleryService = new GalleryService(prisma);
  }

  listMedia = this.asyncHandler(async (req, res) => {
    const { eventCode } = req.params;
    const { skip, limit } = this.getPaginationParams(req);
    const result = await this.galleryService.listMedia(eventCode, skip, limit);
    if (!result) return this.notFound(res, "Event not found");
    return this.success(res, "Gallery retrieved", result.data);
  });

  getMedia = this.asyncHandler(async (req, res) => {
    const { eventCode, mediaId } = req.params;
    const result = await this.galleryService.getMedia(eventCode, mediaId);
    if (!result) return this.notFound(res, "Media not found");
    return this.success(res, "Media retrieved", result.media);
  });
}

export default new GalleryController();
