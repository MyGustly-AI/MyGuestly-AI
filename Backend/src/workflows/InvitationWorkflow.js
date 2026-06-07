/**
 * INVITATION WORKFLOW DESIGN
 *
 * Flow: Host invites guests → Guests receive invitation → Guests confirm RSVP
 * Security: Each guest gets unique QR token for gate verification
 */

export const INVITATION_WORKFLOW = {
  /**
   * Step 1: Host creates guest list
   * POST /events/{eventId}/guests/bulk-invite
   *
   * Request:
   * {
   *   guests: [
   *     { name: "John Doe", email: "john@example.com", phone: "08012345678" },
   *     { name: "Jane Doe", email: "jane@example.com" }
   *   ]
   * }
   *
   * Response:
   * {
   *   success: true,
   *   message: "Invitations sent successfully",
   *   data: {
   *     created: 2,
   *     failed: 0,
   *     guests: [
   *       {
   *         id: "uuid",
   *         name: "John Doe",
   *         email: "john@example.com",
   *         phone: "08012345678",
   *         rsvpStatus: "PENDING",
   *         qrToken: "unique-uuid"
   *       }
   *     ]
   *   }
   * }
   */
  step1_bulk_invite: {
    endpoint: "POST /events/{eventId}/guests/bulk-invite",
    description: "Host invites multiple guests at once",
    security: "authMiddleware, authorize(HOST, ADMIN)",
    validationSchema: "guestSchemas.bulkInvite",
    process: [
      "1. Validate event exists",
      "2. Check host owns event",
      "3. Check capacity not exceeded",
      "4. Create guest records",
      "5. Generate unique QR token per guest",
      "6. Send email/SMS invitations",
      "7. Return created guests",
    ],
  },

  /**
   * Step 2: Guest receives invitation (Email/SMS)
   *
   * Email Template:
   * ---
   * Subject: You're invited to {eventTitle}
   *
   * Dear {guestName},
   *
   * {hostName} invites you to {eventTitle}
   * Date: {eventDate}
   * Venue: {eventVenue}
   *
   * Your Event Code: {eventCode}
   *
   * Click here to confirm your attendance
   * Link: {frontendUrl}/events/{eventCode}/rsvp?token={qrToken}
   * ---
   */
  step2_send_invitation: {
    method: "Email/SMS",
    data_sent: {
      eventTitle: "string",
      eventDate: "date",
      eventVenue: "string",
      eventCode: "ABC-123-DEF",
      guestName: "string",
      qrToken: "unique-uuid",
      responseLink: "frontend_url",
    },
  },

  /**
   * Step 3: Guest confirms RSVP
   * PUT /guests/{guestId}/rsvp
   *
   * Request:
   * {
   *   status: "CONFIRMED" | "DECLINED"
   * }
   *
   * Response:
   * {
   *   success: true,
   *   message: "RSVP confirmed",
   *   data: {
   *     id: "uuid",
   *     name: "John Doe",
   *     rsvpStatus: "CONFIRMED",
   *     qrToken: "unique-uuid"
   *   }
   * }
   */
  step3_rsvp_response: {
    endpoint: "PUT /guests/{guestId}/rsvp",
    description: "Guest confirms or declines attendance",
    security: "optionalAuth (guest can be unauthenticated)",
    validationSchema: "guestSchemas.updateRSVP",
    process: [
      "1. Validate guest exists",
      "2. Validate event still accepting RSVPs",
      "3. Update rsvpStatus",
      "4. Send confirmation email to host",
      "5. Return updated guest",
    ],
  },

  /**
   * Step 4: Host views guest list
   * GET /events/{eventId}/guests?page=1&limit=10&rsvpStatus=CONFIRMED
   *
   * Response:
   * {
   *   success: true,
   *   message: "Guests retrieved",
   *   data: [
   *     {
   *       id: "uuid",
   *       name: "John Doe",
   *       email: "john@example.com",
   *       phone: "08012345678",
   *       rsvpStatus: "CONFIRMED",
   *       checkedIn: false
   *     }
   *   ],
   *   pagination: { page: 1, limit: 10, total: 25, ... }
   * }
   */
  step4_view_guest_list: {
    endpoint: "GET /events/{eventId}/guests",
    description: "Host views all invited guests",
    security: "authMiddleware, authorize(HOST, ADMIN)",
    queryParams: {
      page: "number (default: 1)",
      limit: "number (default: 10)",
      rsvpStatus: "PENDING | CONFIRMED | DECLINED (optional)",
    },
  },

  /**
   * Step 5: At event - Scan QR code for check-in
   * See QR_VERIFICATION_WORKFLOW
   */
  step5_gate_checkin: {
    reference: "QR_VERIFICATION_WORKFLOW",
  },
};

export const INVITATION_WORKFLOW_DIAGRAM = `
┌─────────────────────────────────────────────────────────────────┐
│                    INVITATION WORKFLOW                           │
└─────────────────────────────────────────────────────────────────┘

Step 1: HOST ACTION
┌──────────────────────┐
│ Host creates event   │ → Event created with eventCode (ABC-123-DEF)
│ Uploads guest list   │ → Each guest gets unique qrToken
└──────────────────────┘
        ↓

Step 2: SYSTEM ACTION
┌──────────────────────┐
│ Send Invitations     │ → Email/SMS with eventCode and QR token
│ SMS/Email sent       │ → Frontend link includes guest token
└──────────────────────┘
        ↓

Step 3: GUEST ACTION
┌──────────────────────┐
│ Guest receives       │ → Can open link immediately
│ invitation link      │ → Frontend shows event details
└──────────────────────┘
        ↓

Step 4: GUEST CONFIRMS
┌──────────────────────┐
│ Guest clicks CONFIRM │ → API updates rsvpStatus: "CONFIRMED"
│ or DECLINE           │ → Email sent to host confirming response
└──────────────────────┘
        ↓

Step 5: HOST CHECKS LIST
┌──────────────────────┐
│ Host views           │ → See all guests, RSVP counts
│ guest list on app    │ → Filter by status (Confirmed/Pending/Declined)
└──────────────────────┘
        ↓

Step 6: EVENT DAY
┌──────────────────────┐
│ Organizer scans QR   │ → TOTP verification
│ Guest checks in      │ → checkedIn flag set to true
└──────────────────────┘
`;
