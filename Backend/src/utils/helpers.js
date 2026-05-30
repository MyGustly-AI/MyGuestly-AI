import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import bcrypt from "bcryptjs";

/**
 * JWT Token Utilities
 */
export class JwtUtil {
  /**
   * Generate access token
   */
  static generateAccessToken(userId, role) {
    const payload = {
      userId,
      role,
      type: "access",
    };

    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("Missing JWT_SECRET environment variable");

    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(userId) {
    const payload = {
      userId,
      type: "refresh",
    };

    const expiresIn = "30d";
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret)
      throw new Error("Missing JWT_REFRESH_SECRET environment variable");

    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token) {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error("Missing JWT_SECRET environment variable");
      return jwt.verify(token, secret);
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token) {
    try {
      const secret = process.env.JWT_REFRESH_SECRET;
      if (!secret)
        throw new Error("Missing JWT_REFRESH_SECRET environment variable");
      return jwt.verify(token, secret);
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
  }

  /**
   * Generate token pair
   */
  static generateTokenPair(userId, role) {
    return {
      accessToken: this.generateAccessToken(userId, role),
      refreshToken: this.generateRefreshToken(userId),
    };
  }
}

/**
 * QR Code Utilities
 */
export class QRUtil {
  /**
   * Generate unique QR token
   */
  static generateQRToken() {
    return uuidv4();
  }

  /**
   * Generate event code (short readable code)
   * Format: ABC-123-DEF (3 letters-3 numbers-3 letters)
   */
  static generateEventCode() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";

    let code = "";

    // First group: 3 random letters
    for (let i = 0; i < 3; i++) {
      code += letters[Math.floor(Math.random() * letters.length)];
    }

    code += "-";

    // Second group: 3 random numbers
    for (let i = 0; i < 3; i++) {
      code += numbers[Math.floor(Math.random() * numbers.length)];
    }

    code += "-";

    // Third group: 3 random letters
    for (let i = 0; i < 3; i++) {
      code += letters[Math.floor(Math.random() * letters.length)];
    }

    return code;
  }

  /**
   * Generate TOTP (Time-based One-Time Password)
   * Regenerates every 30 seconds
   */
  static generateTOTP(qrToken, timeStep = 30) {
    const now = Math.floor(Date.now() / 1000);
    const timeCounter = Math.floor(now / timeStep);

    // Create HMAC-SHA256 hash
    const hmac = crypto
      .createHmac("sha256", qrToken)
      .update(timeCounter.toString())
      .digest();

    // Extract 6-digit code from hash
    const offset = hmac[hmac.length - 1] & 0xf;
    const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1000000;

    return code.toString().padStart(6, "0");
  }

  /**
   * Verify TOTP with tolerance
   * Allows ±1 step for network lag
   */
  static verifyTOTP(qrToken, providedCode, timeStep = 30, tolerance = 1) {
    const now = Math.floor(Date.now() / 1000);
    const currentTimeCounter = Math.floor(now / timeStep);

    // Check current time counter and previous/next steps (for tolerance)
    for (let step = -tolerance; step <= tolerance; step++) {
      const timeCounter = currentTimeCounter + step;
      const hmac = crypto
        .createHmac("sha256", qrToken)
        .update(timeCounter.toString())
        .digest();

      const offset = hmac[hmac.length - 1] & 0xf;
      const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1000000;
      const expectedCode = code.toString().padStart(6, "0");

      if (expectedCode === providedCode) {
        return true;
      }
    }

    return false;
  }
}

/**
 * Password Utilities
 */
export class PasswordUtil {
  /**
   * Hash password (basic - use bcrypt in production)
   */
  static hashPassword(password) {
    // Use bcrypt for password hashing
    const saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds);
  }

  /**
   * Compare password (basic - use bcrypt in production)
   */
  static comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }

  /**
   * Generate random password
   */
  static generateRandomPassword(length = 12) {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";

    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password) {
    const requirements = {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /[0-9]/.test(password),
    };

    return requirements;
  }
}

/**
 * Email Utilities
 */
export class EmailUtil {
  /**
   * Format email address
   */
  static formatEmail(email) {
    return email.toLowerCase().trim();
  }

  /**
   * Validate email format
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.formatEmail(email));
  }

  /**
   * Extract domain from email
   */
  static getDomain(email) {
    return this.formatEmail(email).split("@")[1];
  }
}

/**
 * Phone Number Utilities
 */
export class PhoneUtil {
  /**
   * Format phone number (removes special characters)
   */
  static formatPhoneNumber(phone) {
    return phone.replace(/\D/g, "");
  }

  /**
   * Validate Nigerian phone number
   */
  static isValidNigerianPhone(phone) {
    const formatted = this.formatPhoneNumber(phone);
    // Nigerian numbers: 10-11 digits, typically start with 0, 234, etc.
    return /^(0|234)?[789]\d{9}$/.test(formatted);
  }

  /**
   * Normalize Nigerian phone number to standard format
   */
  static normalizeNigerianPhone(phone) {
    let formatted = this.formatPhoneNumber(phone);

    // Remove leading 0 and add 234
    if (formatted.startsWith("0")) {
      formatted = "234" + formatted.substring(1);
    }

    // Add 234 if not present
    if (!formatted.startsWith("234")) {
      formatted = "234" + formatted;
    }

    return formatted;
  }
}

/**
 * Date/Time Utilities
 */
export class DateUtil {
  /**
   * Get current date with time
   */
  static now() {
    return new Date();
  }

  /**
   * Add days to date
   */
  static addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Check if date is in the past
   */
  static isPast(date) {
    return new Date(date) < this.now();
  }

  /**
   * Check if date is in the future
   */
  static isFuture(date) {
    return new Date(date) > this.now();
  }

  /**
   * Format date for display
   */
  static format(date, format = "DD/MM/YYYY") {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return format.replace("DD", day).replace("MM", month).replace("YYYY", year);
  }
}

/**
 * Pagination Utilities
 */
export class PaginationUtil {
  /**
   * Calculate pagination metadata
   */
  static getMetadata(total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };
  }

  /**
   * Calculate skip for database queries
   */
  static getSkip(page, limit) {
    return (page - 1) * limit;
  }

  /**
   * Validate page and limit
   */
  static validateParams(page = 1, limit = 10) {
    return {
      page: Math.max(1, parseInt(page) || 1),
      limit: Math.max(1, Math.min(100, parseInt(limit) || 10)),
    };
  }
}
