/**
 * MEDIA UPLOAD WORKFLOW DESIGN
 *
 * Flow: Guest/Photographer uploads media → Media stored in Cloudinary
 * → AI organizes into moments → Visible in event gallery
 */

export const MEDIA_UPLOAD_WORKFLOW = {
  /**
   * Step 1: Guest/Photographer selects file
   * Frontend file selection → Client-side validation (size, format)
   */
  step1_file_selection: {
    client_side: {
      maxFileSize: "50MB",
      allowedFormats: ["JPG", "PNG", "MP4", "MOV"],
      compression: "Recommended for faster upload",
    },
  },

  /**
   * Step 2: Upload to Cloudinary (Pre-signed URL approach)
   *
   * First, get signed upload URL from backend
   * GET /events/{eventId}/media/upload-url
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     uploadUrl: "https://api.cloudinary.com/...",
   *     uploadToken: "signed-token-with-expiry",
   *     publicId: "myguestly-ai/events/{eventId}/..."
   *   }
   * }
   *
   * Then upload directly to Cloudinary from frontend
   */
  step2_get_upload_url: {
    endpoint: "GET /events/{eventId}/media/upload-url",
    description: "Get pre-signed upload URL from Cloudinary",
    security: "authMiddleware",
    returns: {
      uploadUrl: "Direct Cloudinary upload endpoint",
      uploadToken: "Signed token (expires in 1 hour)",
      publicId: "Media identifier for database",
    },
  },

  /**
   * Step 3: Frontend uploads to Cloudinary
   * Direct upload (bypasses backend for speed)
   * Uses pre-signed URL from Step 2
   *
   * Cloudinary returns:
   * {
   *   secure_url: "https://res.cloudinary.com/...",
   *   public_id: "myguestly-ai/events/{eventId}/...",
   *   resource_type: "image" | "video"
   * }
   */
  step3_direct_upload: {
    method: "Direct to Cloudinary",
    benefits: [
      "Faster upload (no backend proxy)",
      "Reduced server load",
      "Automatic image optimization",
      "Video transcoding",
    ],
  },

  /**
   * Step 4: Register media in database
   * POST /events/{eventId}/media
   *
   * Request:
   * {
   *   mediaType: "IMAGE" | "VIDEO",
   *   url: "https://res.cloudinary.com/...",
   *   caption: "Moment caption (optional)"
   * }
   *
   * Response:
   * {
   *   success: true,
   *   message: "Media uploaded successfully",
   *   data: {
   *     id: "uuid",
   *     url: "https://res.cloudinary.com/...",
   *     mediaType: "IMAGE",
   *     uploadedBy: "userId or GUEST",
   *     voiceNoteUrl: null,
   *     createdAt: "2026-05-29T10:30:00Z"
   *   }
   * }
   */
  step4_register_media: {
    endpoint: "POST /events/{eventId}/media",
    description: "Register uploaded media in database",
    security: "authMiddleware",
    validationSchema: "mediaSchemas.upload",
    process: [
      "1. Validate event exists",
      "2. Validate media URL is from Cloudinary",
      "3. Create media record",
      "4. Trigger AI analysis (async)",
      "5. Add to event gallery",
    ],
  },

  /**
   * Step 5: AI Analysis (Background Job)
   *
   * System analyzes image/video to categorize into moments:
   * - Ceremony
   * - Reception/Food
   * - Dance/Entertainment
   * - Guest Interactions
   * - Venue/Decorations
   * - Candid Moments
   *
   * Updates media record with tags and moment category
   */
  step5_ai_analysis: {
    async_job: "Background processing",
    analyzes: [
      "Image recognition for moment type",
      "Face detection for guest presence",
      "Scene understanding (indoor/outdoor, activity)",
      "Quality assessment (brightness, focus, composition)",
    ],
    stores_metadata: {
      momentType:
        "CEREMONY | RECEPTION | DANCE | INTERACTIONS | VENUE | CANDID",
      quality: "HIGH | MEDIUM | LOW",
      detectedFaces: "number",
      tags: ["array of tags"],
    },
  },

  /**
   * Step 6: Add Voice Note to Media (Optional)
   * POST /events/{eventId}/media/{mediaId}/voice-note
   *
   * Request:
   * {
   *   voiceNoteUrl: "https://res.cloudinary.com/.../audio.mp3"
   * }
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     id: "uuid",
   *     voiceNoteUrl: "https://res.cloudinary.com/.../audio.mp3",
   *     updatedAt: "2026-05-29T10:35:00Z"
   *   }
   * }
   */
  step6_voice_note: {
    endpoint: "POST /events/{eventId}/media/{mediaId}/voice-note",
    description: "Guest adds voice message to photo/video",
    security: "authMiddleware",
    use_case: "Guest can record message: 'This was such a beautiful moment!'",
  },

  /**
   * Step 7: View Event Gallery
   * GET /events/{eventId}/media?page=1&limit=20&mediaType=IMAGE
   *
   * Response:
   * {
   *   success: true,
   *   message: "Media retrieved",
   *   data: [
   *     {
   *       id: "uuid",
   *       url: "https://res.cloudinary.com/...",
   *       mediaType: "IMAGE",
   *       momentType: "DANCE",
   *       uploadedBy: "John Doe",
   *       voiceNoteUrl: "https://...",
   *       quality: "HIGH",
   *       createdAt: "2026-05-29T10:30:00Z"
   *     }
   *   ],
   *   pagination: { ... }
   * }
   */
  step7_view_gallery: {
    endpoint: "GET /events/{eventId}/media",
    description: "View all uploaded media for event",
    security: "optionalAuth (guests can view with event code)",
    queryParams: {
      page: "number",
      limit: "number",
      mediaType: "IMAGE | VIDEO (optional)",
      momentType: "CEREMONY | DANCE | etc. (optional)",
    },
  },

  /**
   * Step 8: AI Timeline Organization
   * GET /events/{eventId}/timeline
   *
   * Returns media grouped by moment type and chronological order
   * Frontend displays as visual timeline
   *
   * Response structure:
   * {
   *   timeline: [
   *     {
   *       moment: "CEREMONY",
   *       time: "10:30 AM",
   *       media: [...]
   *     },
   *     {
   *       moment: "RECEPTION",
   *       time: "12:00 PM",
   *       media: [...]
   *     }
   *   ]
   * }
   */
  step8_ai_timeline: {
    endpoint: "GET /events/{eventId}/timeline",
    description: "View AI-organized event timeline",
    security: "optionalAuth",
    organization: "By moment type → Chronological",
  },

  /**
   * Step 9: Download Event Album (Premium)
   * GET /events/{eventId}/album/download
   *
   * Generates ZIP with all event media
   * Available for event hosts and photographers
   */
  step9_download_album: {
    endpoint: "GET /events/{eventId}/album/download",
    description: "Download all event media as ZIP",
    security: "authMiddleware, authorize(HOST, PHOTOGRAPHER, ADMIN)",
    includes: [
      "All photos and videos",
      "Metadata and tags",
      "Voice notes (as separate files)",
    ],
  },
};

export const MEDIA_UPLOAD_WORKFLOW_DIAGRAM = `
┌──────────────────────────────────────────────────────────────────────┐
│                   MEDIA UPLOAD WORKFLOW                              │
└──────────────────────────────────────────────────────────────────────┘

Step 1-3: UPLOAD PROCESS
┌─────────────────────┐         ┌──────────────────┐
│ Guest selects       │ ──→ GET │ Get upload URL   │ ──→ Response with
│ photo/video file    │    /media/upload-url       │     pre-signed URL
└─────────────────────┘         └──────────────────┘
        ↓
┌─────────────────────┐         ┌──────────────────┐
│ Frontend uploads    │ ──→ PUT │ Cloudinary       │ ──→ Returns
│ directly to CDN     │    (Direct)                │     secure_url
└─────────────────────┘         └──────────────────┘
        ↓

Step 4: REGISTER IN DATABASE
┌─────────────────────┐         ┌──────────────────┐
│ POST /media         │ ──→     │ Create media     │ ──→ Media stored
│ with Cloudinary URL │         │ record in DB     │     in database
└─────────────────────┘         └──────────────────┘
        ↓

Step 5: AI ANALYSIS (ASYNC)
┌─────────────────────┐         ┌──────────────────┐
│ Background job      │ ──→     │ AI categorizes   │ ──→ Tags and moment
│ processes image     │         │ into moment type │     type added
└─────────────────────┘         └──────────────────┘
        ↓

Step 6: OPTIONAL - VOICE NOTE
┌─────────────────────┐         ┌──────────────────┐
│ Guest records       │ ──→     │ Attach voice     │ ──→ Memory preserved
│ message/wish        │    /media/{id}/voice-note  │     with media
└─────────────────────┘         └──────────────────┘
        ↓

Step 7-8: VIEW & ORGANIZE
┌─────────────────────┐         ┌──────────────────┐
│ GET /media          │ ──→     │ View all media   │ ──→ Gallery displayed
│ GET /timeline       │         │ or AI timeline   │
└─────────────────────┘         └──────────────────┘
        ↓

Step 9: DOWNLOAD (Premium)
┌─────────────────────┐         ┌──────────────────┐
│ Host requests       │ ──→     │ Generate ZIP     │ ──→ Download link
│ album download      │    /album/download        │     (all media)
└─────────────────────┘         └──────────────────┘
`;

export const CLOUDINARY_INTEGRATION = {
  setup: {
    cloudName: "CLOUDINARY_CLOUD_NAME from .env",
    apiKey: "CLOUDINARY_API_KEY from .env",
    apiSecret: "CLOUDINARY_API_SECRET from .env",
  },
  upload_folders: {
    events: "myguestly-ai/events/{eventId}",
    profiles: "myguestly-ai/profiles/{userId}",
    thumbnails: "myguestly-ai/thumbnails",
  },
  transformations: {
    thumbnail: "c_thumb,w_200,h_200",
    preview: "c_scale,w_600,q_auto",
    fullscreen: "c_scale,w_1200,q_auto",
    video_preview: "c_thumb,w_300,h_300,so_auto",
  },
};
