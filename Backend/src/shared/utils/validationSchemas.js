import Joi from "joi";

/**
 * Centralized Validation Schemas
 * Used for request validation across all endpoints
 */

// AUTH SCHEMAS
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

// EVENT SCHEMAS
export const eventSchemas = {
  create: Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().max(1000).optional(),
    eventCategory: Joi.string()
      .valid("Wedding", "Gala", "Birthday", "Corporate", "Church")
      .required(),
    venueName: Joi.string().min(3).max(200).required(),
    address: Joi.string().min(5).max(300).required(),
    coverUrl: Joi.string().uri().optional(),
    themeAccent: Joi.alternatives()
      .try(
        Joi.string().pattern(/^#?([0-9A-F]{3}|[0-9A-F]{6})$/i),
        Joi.string().valid(
          "#FF6B6B",
          "#6B5BFF",
          "#FFD166",
          "#06D6A0",
          "#FF9AA2",
          "Purple",
          "Navy",
          "Teal",
          "Maroon",
        ),
      )
      .optional(),
    rsvpDeadline: Joi.date().iso().optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
    location: Joi.string().min(3).max(200).optional(),
    maxGuests: Joi.number().integer().min(1).max(10000).required(),
  }).custom((value, helpers) => {
    // ensure rsvpDeadline (if provided) is before startDate
    if (value.rsvpDeadline && value.startDate) {
      const rsvp = new Date(value.rsvpDeadline);
      const start = new Date(value.startDate);
      if (rsvp >= start) {
        return helpers.message("\"rsvpDeadline\" must be before \"startDate\"");
      }
    }

    // ensure endDate is after startDate
    if (value.endDate && value.startDate) {
      const end = new Date(value.endDate);
      const start = new Date(value.startDate);
      if (end <= start) {
        return helpers.message("\"endDate\" must be after \"startDate\"");
      }
    }

    return value;
  }),

  update: Joi.object({
    title: Joi.string().min(3).max(200).optional(),
    description: Joi.string().max(1000).optional(),
    eventCategory: Joi.string()
      .valid("Wedding", "Gala", "Birthday", "Corporate", "Church")
      .optional(),
    venueName: Joi.string().min(3).max(200).optional(),
    address: Joi.string().min(5).max(300).optional(),
    coverUrl: Joi.string().uri().optional(),
    themeAccent: Joi.string().max(50).optional(),
    rsvpDeadline: Joi.date().iso().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    location: Joi.string().min(3).max(200).optional(),
    maxGuests: Joi.number().integer().min(1).max(10000).optional(),
  }).custom((value, helpers) => {
    // For updates, only validate when the related fields are present
    if (value.rsvpDeadline && value.startDate) {
      const rsvp = new Date(value.rsvpDeadline);
      const start = new Date(value.startDate);
      if (rsvp >= start) {
        return helpers.message("\"rsvpDeadline\" must be before \"startDate\"");
      }
    }

    if (value.endDate && value.startDate) {
      const end = new Date(value.endDate);
      const start = new Date(value.startDate);
      if (end <= start) {
        return helpers.message("\"endDate\" must be after \"startDate\"");
      }
    }

    return value;
  }),

  list: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string()
      .valid("DRAFT", "ACTIVE", "ONGOING", "COMPLETED")
      .optional(),
  }),
};

// GUEST SCHEMAS
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
        }).or("email", "phone")
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

// MEDIA SCHEMAS
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

// MEMORY SCHEMAS
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

// QR VERIFICATION SCHEMAS
export const qrSchemas = {
  verify: Joi.object({
    token: Joi.string().uuid().required(),
  }),
};

// VALIDATION UTILITY
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

// VALIDATION UTILITY FOR QUERY PARAMS
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

    // Avoid assigning to `req.query` directly because some request
    // implementations expose it as a getter-only property. Store the
    // validated values on `req.validatedQuery` and keep original
    // `req.query` intact for compatibility.
    req.validatedQuery = value;
    next();
  };
};
