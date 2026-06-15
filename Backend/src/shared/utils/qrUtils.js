import jwt from "jsonwebtoken";

const QR_SECRET = process.env.QR_SECRET || process.env.JWT_SECRET;
const QR_EXPIRY = process.env.QR_TOKEN_EXPIRY || "7d";

export class QrUtils {
  static signQRToken(invitationId, eventId) {
    return jwt.sign(
      { invitationId, eventId },
      QR_SECRET,
      { expiresIn: QR_EXPIRY },
    );
  }

  static verifyQRToken(token) {
    try {
      return jwt.verify(token, QR_SECRET);
    } catch {
      return null;
    }
  }
}
