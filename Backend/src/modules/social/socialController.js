import { BaseController } from "../../shared/base/BaseController.js";
import { SocialService } from "./socialService.js";
import { prisma } from "../../shared/utils/prisma.js";

class SocialController extends BaseController {
  constructor() {
    super();
    this.socialService = new SocialService(prisma);
  }

  addComment = this.asyncHandler(async (req, res) => {
    const { mediaId } = req.params;
    const { content } = req.body;
    const comment = await this.socialService.addComment(mediaId, req.user.id, content);
    return this.created(res, "Comment added", comment);
  });

  listComments = this.asyncHandler(async (req, res) => {
    const { mediaId } = req.params;
    const { page, limit, skip } = this.getPaginationParams(req);
    const { data, total } = await this.socialService.listComments(mediaId, skip, limit);
    return this.paginated(res, data, page, limit, total, "Comments retrieved");
  });

  deleteComment = this.asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    await this.socialService.deleteComment(commentId, req.user.id);
    return this.success(res, "Comment deleted");
  });

  toggleLike = this.asyncHandler(async (req, res) => {
    const { mediaId } = req.params;
    const result = await this.socialService.toggleLike(mediaId, req.user.id);
    return this.success(res, result.liked ? "Liked" : "Unliked", result);
  });

  getLikeCount = this.asyncHandler(async (req, res) => {
    const { mediaId } = req.params;
    const result = await this.socialService.getLikeCount(mediaId);
    return this.success(res, "Like count retrieved", result);
  });
}

export default new SocialController();
