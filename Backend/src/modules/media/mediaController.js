import { BaseController } from "../../shared/base/BaseController.js";
import { MediaService } from "./mediaService.js";
import { prisma } from "../../shared/utils/prisma.js";
import { generateUploadSignature } from "../../shared/utils/cloudinary.js";
import { AppError } from "../../shared/utils/AppError.js";
import { mediaQueue } from "../../infra/queues/mediaQueue.js";

class MediaController extends BaseController {
  constructor() {
    super();
    this.mediaService = new MediaService(prisma);
  }

  /**
   * GET /events/:eventId/media/upload-url
   * Get pre-signed upload URL for Cloudinary
   */
  getUploadUrl = this.asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const folder = `myguestly-ai/events/${eventId}`;
    const signatureData = generateUploadSignature(folder);

    this.success(res, "Upload signature generated", {
      uploadUrl: `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`,
      ...signatureData
    });
  });

  /**
   * POST /events/:eventId/media
   * Register uploaded media in database
   */
  registerMedia = this.asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { mediaType, url, publicId, caption } = req.body;
    const uploaderId = req.user.id; // user or guest

    const media = await this.mediaService.createMedia({
      eventId,
      uploaderId,
      mediaType,
      url,
      publicId,
      caption,
    });

    try {
      await mediaQueue.add("process", { mediaId: media.id });
    } catch (err) {
      console.warn("Failed to enqueue media processing:", err?.message || err);
    }

    this.created(res, "Media uploaded successfully", media);
  });

  /**
   * GET /events/:eventId/media
   * List all media for event
   */
  listGallery = this.asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { page, limit, skip } = this.getPaginationParams(req);
    const filters = {};
    if (req.validatedQuery?.mediaType) {
      filters.mediaType = req.validatedQuery.mediaType;
    }

    const { data, total } = await this.mediaService.getMediaGallery(eventId, filters, skip, limit);
    this.paginated(res, data, page, limit, total, "Media retrieved");
  });

  /**
   * POST /events/:eventId/media/:mediaId/voice-note
   * Add voice note to media
   */
  addVoiceNote = this.asyncHandler(async (req, res) => {
    const { mediaId } = req.params;
    const { voiceNoteUrl } = req.body;
    
    const media = await this.mediaService.addVoiceNote(mediaId, voiceNoteUrl);
    this.success(res, "Voice note added successfully", media);
  });

  /**
   * POST /events/:eventId/media/:mediaId/comments
   * Add comment to media
   */
  addComment = this.asyncHandler(async (req, res) => {
    const { mediaId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) throw AppError.badRequest("Comment content is required");

    const comment = await this.mediaService.addComment(mediaId, userId, content);
    this.created(res, "Comment added successfully", comment);
  });

  /**
   * POST /events/:eventId/media/:mediaId/likes
   * Toggle like on media
   */
  toggleLike = this.asyncHandler(async (req, res) => {
    const { mediaId } = req.params;
    const userId = req.user.id;

    const result = await this.mediaService.toggleLike(mediaId, userId);
    this.success(res, result.liked ? "Media liked" : "Media unliked", result);
  });
}

export default new MediaController();
