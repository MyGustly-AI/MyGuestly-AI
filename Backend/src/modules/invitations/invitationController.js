import { BaseController } from "../../shared/base/BaseController.js";
import { InvitationService } from "./invitationService.js";
import { prisma } from "../../shared/utils/prisma.js";

class InvitationController extends BaseController {
  constructor() {
    super();
    this.invitationService = new InvitationService(prisma);
  }

  getInvitation = this.asyncHandler(async (req, res) => {
    const { invitationId } = req.params;
    const invitation = await this.invitationService.getInvitation(invitationId);
    return this.success(res, "Invitation retrieved", invitation);
  });

  rsvp = this.asyncHandler(async (req, res) => {
    const { invitationId } = req.params;
    const { status } = req.body;
    const invitation = await this.invitationService.getInvitation(invitationId);
    const updated = await this.invitationService.rsvp(invitation.token, status);
    return this.success(res, "RSVP updated", updated);
  });

  resendInvitation = this.asyncHandler(async (req, res) => {
    const { invitationId } = req.params;
    await this.invitationService.resendInvitation(invitationId);
    return this.success(res, "Invitation resent");
  });
}

export default new InvitationController();
