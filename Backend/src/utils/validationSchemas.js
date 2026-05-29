import Joi from "joi";

/**
 * Centralized Validation Schemas
 * Used for request validation across all endpoints
 */

// ============================================
// AUTH SCHEMAS
// ============================================
export const authSchemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("HOST", "PHOTOGRAPHER", "ADMIN").default("HOST"),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),
};

// ============================================
// EVENT SCHEMAS
// ============================================
export const eventSchemas = {
  create: Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().max(1000).optional(),
    date: Joi.date().min("now").required(),
    venue: Joi.string().min(3).max(200).required(),
    capacity: Joi.number().integer().min(1).optional(),
  }),

  update: Joi.object({
    title: Joi.string().min(3).max(200).optional(),
    description: Joi.string().max(1000).optional(),
    date: Joi.date().min("now").optional(),
    venue: Joi.string().min(3).max(200).optional(),
    capacity: Joi.number().integer().min(1).optional(),
  }),

  list: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid("UPCOMING", "ONGOING", "COMPLETED").optional(),
  }),
};

// ============================================
// GUEST SCHEMAS
// ============================================
export const guestSchemas = {
  invite: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().optional(),
    phone: Joi.string()
      .pattern(/^[0-9]{10,15}$/)
      .optional(),
  }).or("email", "phone"),

  bulkInvite: Joi.object({
    guests: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().min(2).max(100).required(),
          email: Joi.string().email().optional(),
          phone: Joi.string()
            .pattern(/^[0-9]{10,15}$/)
            .optional(),
        }).or("email", "phone"),
      )
      .min(1)
      .required(),
  }),

  updateRSVP: Joi.object({
    status: Joi.string().valid("PENDING", "CONFIRMED", "DECLINED").required(),
  }),

  list: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    rsvpStatus: Joi.string()
      .valid("PENDING", "CONFIRMED", "DECLINED")
      .optional(),
  }),
};

// ============================================
// MEDIA SCHEMAS
// ============================================
export const mediaSchemas = {
  upload: Joi.object({
    mediaType: Joi.string().valid("IMAGE", "VIDEO").required(),
    url: Joi.string().uri().required(),
    caption: Joi.string().max(500).optional(),
  }),

  addVoiceNote: Joi.object({
    voiceNoteUrl: Joi.string().uri().required(),
    caption: Joi.string().max(500).optional(),
  }),

  list: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    mediaType: Joi.string().valid("IMAGE", "VIDEO").optional(),
  }),
};

// ============================================
// MEMORY SCHEMAS
// ============================================
export const memorySchemas = {
  addMemory: Joi.object({
    content: Joi.string().max(1000).required(),
    type: Joi.string().valid("TEXT", "VOICE", "VIDEO").default("TEXT"),
    mediaUrl: Joi.string().uri().optional(),
  }),

  updateMemory: Joi.object({
    content: Joi.string().max(1000).optional(),
    mediaUrl: Joi.string().uri().optional(),
  }),

  list: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    type: Joi.string().valid("TEXT", "VOICE", "VIDEO").optional(),
  }),
};

// ============================================
// QR VERIFICATION SCHEMAS
// ============================================
export const qrSchemas = {
  verify: Joi.object({
    token: Joi.string().uuid().required(),
  }),
};

// ============================================
// VALIDATION UTILITY
// ============================================
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        data: null,
        errors,
        timestamp: new Date().toISOString(),
      });
    }

    req.body = value;
    next();
  };
};

// ============================================
// VALIDATION UTILITY FOR QUERY PARAMS
// ============================================
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        data: null,
        errors,
        timestamp: new Date().toISOString(),
      });
    }

    req.query = value;
    next();
  };
};
