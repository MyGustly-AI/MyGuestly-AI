/**
 * EVENT MODULE FLOW DESIGN
 * 
 * Core workflow: Create → Configure → Invite → Verify → Archive
 */

export const EVENT_MODULE_FLOW = {
  /**
   * PHASE 1: EVENT CREATION
   * 
   * POST /events
   * 
   * Request:
   * {
   *   title: "Amara's Wedding Celebration",
   *   description: "A beautiful day with family and friends",
   *   date: "2026-06-15T14:00:00Z",
   *   venue: "Lagos Continental Hotel, Lagos",
   *   capacity: 150
   * }
   * 
   * Response:
   * {
   *   success: true,
   *   message: "Event created successfully",
   *   data: {
   *     id: "uuid",
   *     title: "Amara's Wedding Celebration",
   *     description: "A beautiful day with family and friends",
   *     date: "2026-06-15T14:00:00Z",
   *     venue: "Lagos Continental Hotel, Lagos",
   *     capacity: 150,
   *     eventCode: "AMR-642-LOS",
   *     hostId: "uuid",
   *     createdAt: "2026-05-29T10:00:00Z",
   *     updatedAt: "2026-05-29T10:00:00Z"
   *   }
   * }
   */
  phase1_create: {
    endpoint: "POST /events",
    method: "CREATE",
    security: "authMiddleware, authorize(HOST, ADMIN)",
    validationSchema: "eventSchemas.create",
    process: [
      "1. Validate host not exceeding event quota",
      "2. Validate date is in future",
      "3. Validate venue location is valid",
      "4. Generate unique eventCode (ABC-123-DEF)",
      "5. Create event record",
      "6. Associate with host (userId)",
      "7. Return event details"
    ],
    triggers: [
      "Event created notification sent to host"
    ]
  },

  /**
   * PHASE 2: EVENT CONFIGURATION
   * 
   * PUT /events/{eventId}
   * 
   * Request:
   * {
   *   title: "Updated title",
   *   capacity: 200
   * }
   * 
   * Host can update event before invitations sent
   */
  phase2_configure: {
    endpoint: "PUT /events/{eventId}",
    method: "UPDATE",
    security: "authMiddleware, authorize(HOST, ADMIN)",
    validationSchema: "eventSchemas.update",
    restrictions: [
      "Cannot change date to past date",
      "Cannot reduce capacity below current guest count"
    ],
    process: [
      "1. Verify host owns event",
      "2. Validate update payload",
      "3. Check capacity constraints",
      "4. Update event record",
      "5. Return updated event"
    ]
  },

  /**
   * PHASE 3: GUEST INVITATION
   * 
   * See InvitationWorkflow.js for detailed flow
   * 
   * POST /events/{eventId}/guests/bulk-invite
   */
  phase3_invite_guests: {
    reference: "InvitationWorkflow.js",
    endpoints: [
      "POST /events/{eventId}/guests/bulk-invite",
      "GET /events/{eventId}/guests",
      "PUT /guests/{guestId}/rsvp"
    ]
  },

  /**
   * PHASE 4: EVENT DASHBOARD (Before Event)
   * 
   * GET /events/{eventId}/dashboard
   * 
   * Response:
   * {
   *   success: true,
   *   data: {
   *     event: { ... event details ... },
   *     statistics: {
   *       totalInvited: 150,
   *       confirmed: 120,
   *       declined: 10,
   *       pending: 20,
   *       confirmationRate: 80
   *     },
   *     recentActivity: [
   *       {
   *         type: "RSVP_CONFIRMED",
   *         guestName: "John Doe",
   *         timestamp: "2026-05-28T15:30:00Z"
   *       }
   *     ]
   *   }
   * }
   */
  phase4_pre_event_dashboard: {
    endpoint: "GET /events/{eventId}/dashboard",
    method: "READ",
    security: "authMiddleware, authorize(HOST, ADMIN)",
    displays: [
      "Event details",
      "RSVP statistics",
      "Guest list",
      "Recent activity",
      "Confirmation rate",
      "Media count"
    ]
  },

  /**
   * PHASE 5: GATE VERIFICATION (During Event)
   * 
   * See QRVerificationWorkflow.js for detailed flow
   * 
   * POST /verify-gate/{token}
   */
  phase5_gate_verification: {
    reference: "QRVerificationWorkflow.js",
    endpoints: [
      "POST /verify-gate/{token}",
      "GET /events/{eventId}/check-ins"
    ]
  },

  /**
   * PHASE 6: REAL-TIME UPDATES (During Event)
   * 
   * GET /events/{eventId}/live-stats
   * 
   * Real-time data as guests check in
   * Response updates every few seconds
   */
  phase6_live_statistics: {
    endpoint: "GET /events/{eventId}/live-stats",
    method: "READ (WebSocket for real-time)",
    security: "authMiddleware, authorize(HOST, ADMIN, ORGANIZER)",
    displays: [
      "Live check-in count",
      "Check-in rate per minute",
      "No-show predictions",
      "Capacity status",
      "Recent check-ins"
    ]
  },

  /**
   * PHASE 7: MEDIA UPLOAD & SHARING (During & After)
   * 
   * See MediaUploadWorkflow.js for detailed flow
   * 
   * POST /events/{eventId}/media
   * GET /events/{eventId}/media
   * GET /events/{eventId}/timeline
   */
  phase7_media_sharing: {
    reference: "MediaUploadWorkflow.js",
    endpoints: [
      "POST /events/{eventId}/media",
      "POST /events/{eventId}/media/{mediaId}/voice-note",
      "GET /events/{eventId}/media",
      "GET /events/{eventId}/timeline"
    ]
  },

  /**
   * PHASE 8: EVENT ARCHIVE (After Event)
   * 
   * GET /events/{eventId}/archive
   * 
   * Complete event summary for records
   * Response:
   * {
   *   event: { ... },
   *   statistics: {
   *     totalInvited: 150,
   *     totalAttended: 118,
   *     attendanceRate: 78.67,
   *     declined: 10,
   *     noShow: 22,
   *     totalMedia: 450,
   *     totalVoiceNotes: 35
   *   },
   *   media: { ... all event media ... },
   *   memories: { ... all voice notes & written memories ... },
   *   guestList: { ... }
   * }
   */
  phase8_event_archive: {
    endpoint: "GET /events/{eventId}/archive",
    method: "READ",
    security: "authMiddleware, authorize(HOST, PHOTOGRAPHER, ADMIN)",
    includes: [
      "Event summary",
      "Attendance statistics",
      "All media files",
      "All voice notes",
      "Guest list with check-in times",
      "Event timeline"
    ]
  },

  /**
   * PHASE 9: DELETE EVENT
   * 
   * DELETE /events/{eventId}
   * 
   * Only allowed before event date or by admin
   * Archive is kept for records
   */
  phase9_delete: {
    endpoint: "DELETE /events/{eventId}",
    method: "DELETE",
    security: "authMiddleware, authorize(HOST, ADMIN)",
    restrictions: [
      "Cannot delete past events (archive only)",
      "Confirmation required if media exists",
      "Only event owner or admin can delete"
    ]
  }
};

export const EVENT_LIFECYCLE_DIAGRAM = `
┌────────────────────────────────────────────────────────────────────────┐
│                        EVENT LIFECYCLE                                 │
└────────────────────────────────────────────────────────────────────────┘

BEFORE EVENT
═══════════════════════════════════════════════════════════════════════════

Phase 1: CREATE
┌─────────────────┐
│ Host creates    │ → Event generated with unique code (ABC-123-DEF)
│ event details   │
└─────────────────┘
        ↓

Phase 2: CONFIGURE
┌─────────────────┐
│ Host updates    │ → Can modify title, venue, capacity, date
│ event settings  │
└─────────────────┘
        ↓

Phase 3: INVITE
┌─────────────────┐
│ Host uploads    │ → Each guest gets unique QR token
│ guest list      │ → Invitations sent via email/SMS
│ (Bulk invite)   │
└─────────────────┘
        ↓

Phase 4: PRE-EVENT DASHBOARD
┌─────────────────┐
│ Host views      │ → Track RSVPs, confirmations, attendance rate
│ guest responses │
└─────────────────┘


DURING EVENT
═══════════════════════════════════════════════════════════════════════════

Phase 5: GATE VERIFICATION
┌─────────────────┐
│ Organizer scans │ → QR code verified with TOTP
│ guest QR code   │ → Guest checked in, timestamp recorded
│ at entrance     │
└─────────────────┘
        ↓

Phase 6: LIVE STATS
┌─────────────────┐
│ Real-time       │ → Check-in count updates live
│ check-in display│ → Host monitors attendance
└─────────────────┘
        ↓

Phase 7: MEDIA UPLOAD
┌─────────────────┐
│ Guests/Photog   │ → Photos, videos uploaded to gallery
│ upload moments  │ → Voice notes attached to memories
│ & memories      │
└─────────────────┘


AFTER EVENT
═══════════════════════════════════════════════════════════════════════════

Phase 8: ARCHIVE
┌─────────────────┐
│ Complete event  │ → Final statistics, all media, guest records
│ record created  │ → Timeline organized by AI
└─────────────────┘
        ↓

Phase 9: DELETE (Optional)
┌─────────────────┐
│ Host can delete │ → Archive kept for records only
│ event record    │
└─────────────────┘
`;

export const EVENT_STATUS_ENUM = {
  DRAFT: "Event created, not yet published",
  ACTIVE: "Invitations sent, accepting RSVPs",
  ONGOING: "Event is happening right now",
  COMPLETED: "Event finished, archive available",
  CANCELLED: "Event cancelled by host"
};

export const EVENT_PERMISSIONS = {
  HOST: {
    can_create: true,
    can_update_own: true,
    can_delete_own: true,
    can_invite_guests: true,
    can_verify_gate: true,
    can_view_checkins: true,
    can_upload_media: true,
    can_download_archive: true
  },
  PHOTOGRAPHER: {
    can_create: false,
    can_upload_media: true,
    can_view_media: true,
    can_download_archive: true
  },
  GUEST: {
    can_view_event: true,
    can_rsvp: true,
    can_upload_media: true,
    can_view_media: true,
    can_add_voice_note: true,
    can_download_archive: false
  },
  ADMIN: {
    can_create: true,
    can_update_any: true,
    can_delete_any: true,
    can_view_any: true
  }
};
