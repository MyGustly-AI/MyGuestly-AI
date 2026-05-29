/**
 * QR VERIFICATION WORKFLOW DESIGN
 * 
 * CRITICAL FLOW: Secure gate access with anti-fraud measures
 * - TOTP prevents screenshot attacks
 * - Atomic check-in prevents duplicate scans
 * - Logging tracks security violations
 */

export const QR_VERIFICATION_WORKFLOW = {
  /**
   * STEP 1: GENERATE QR CODE (During invitation)
   * 
   * Each guest gets:
   * - Permanent qrToken: UUID that doesn't change
   * - Dynamic TOTP: Changes every 30 seconds
   * - Event code: ABC-123-DEF (short readable code)
   * 
   * Frontend displays: {eventCode}-{TOTP}
   * Example: ABC-123-DEF-847392
   * 
   * Encoded in QR:
   * "https://myguestly.ai/verify/{qrToken}"
   * 
   * QR code is included in guest invitation
   */
  step1_generate_qr: {
    backend_generates: {
      qrToken: "UUID (permanent)",
      eventCode: "ABC-123-DEF (short code)",
      totp: "6-digit code (changes every 30s)"
    },
    frontend_displays: "QR code + visible code ABC-123-DEF-847392",
    encoding: "https://myguestly.ai/verify/{qrToken}",
    security_features: [
      "QR token is unique per guest",
      "TOTP regenerates every 30 seconds",
      "Screenshot useless after 30 seconds"
    ]
  },

  /**
   * STEP 2: GUEST SAVES QR CODE
   * Frontend flow:
   * 1. Guest receives invitation link
   * 2. Opens invitation on their phone
   * 3. Sees event details + QR code
   * 4. Saves screenshot or adds to wallet
   * 5. Brings to event day
   */
  step2_guest_saves: {
    guest_action: "Save QR code for event day",
    available_options: [
      "Take screenshot",
      "Save to phone gallery",
      "Add to Apple Wallet",
      "Add to Google Pay"
    ]
  },

  /**
   * STEP 3: AT EVENT - GATE ENTRY
   * Organizer has mobile app with camera/scanner
   * 
   * Flow:
   * 1. Guest arrives at venue entrance
   * 2. Organizer/bouncer opens app to scanner
   * 3. Points camera at guest's QR code
   * 4. App captures and sends to backend
   */
  step3_gate_scan: {
    device: "Organizer's phone with MyGuestly app",
    method: "Camera scans QR code",
    captures: "qrToken from QR code"
  },

  /**
   * STEP 4: BACKEND VERIFICATION (CRITICAL SECURITY)
   * 
   * POST /verify-gate/{qrToken}
   * 
   * Request:
   * {
   *   totp: "847392"
   * }
   * 
   * Response on success:
   * {
   *   success: true,
   *   message: "Guest verified and checked in",
   *   data: {
   *     guestId: "uuid",
   *     guestName: "John Doe",
   *     checkedIn: true,
   *     checkInTime: "2026-06-15T14:05:32Z",
   *     status: "CHECKED_IN"
   *   }
   * }
   * 
   * Response on error:
   * {
   *   success: false,
   *   message: "Invalid QR token or TOTP",
   *   statusCode: 400 | 401 | 409
   * }
   */
  step4_backend_verify: {
    endpoint: "POST /verify-gate/{qrToken}",
    method: "VERIFY + CHECK-IN",
    security: "authMiddleware, authorize(ADMIN, ORGANIZER)",
    validationSchema: "qrSchemas.verify",
    
    process: [
      "1. Find guest by qrToken in database",
      "2. Verify guest exists and is invited",
      "3. Verify TOTP is within tolerance window (±1 step)",
      "4. Atomic update: set checkedIn = true",
      "5. Record checkInTime timestamp",
      "6. Return check-in confirmation"
    ],

    security_checks: [
      {
        check: "QR Token Valid?",
        invalid_response: "401 Unauthorized - Invalid token"
      },
      {
        check: "Guest Invited to This Event?",
        invalid_response: "404 Not Found - Guest not invited"
      },
      {
        check: "TOTP Correct (with ±1 step tolerance)?",
        invalid_response: "400 Bad Request - Invalid TOTP",
        details: "Allows for clock skew between devices"
      },
      {
        check: "Already Checked In?",
        invalid_response: "409 Conflict - Duplicate scan (already checked in)",
        details: "Prevents replay attacks"
      },
      {
        check: "Event Not Cancelled?",
        invalid_response: "400 Bad Request - Event cancelled"
      }
    ]
  },

  /**
   * STEP 4B: ATOMIC CHECK-IN (CRITICAL)
   * 
   * Pseudocode:
   * ```
   * BEGIN TRANSACTION
   *   SELECT guest WHERE qrToken = ? FOR UPDATE
   *   IF guest.checkedIn = true
   *     THROW ConflictError("Already checked in")
   *   END IF
   *   UPDATE guest SET 
   *     checkedIn = true,
   *     checkInTime = NOW()
   *   WHERE qrToken = ?
   * COMMIT
   * ```
   * 
   * Ensures:
   * - No race conditions
   * - Exactly one check-in per guest
   * - Duplicate scans caught immediately
   */
  step4b_atomic_operation: {
    critical_security: "ATOMIC TRANSACTION",
    prevents: [
      "Double-check-in",
      "Race condition attacks",
      "Concurrent scan exploits"
    ],
    database_lock: "SELECT FOR UPDATE to lock row"
  },

  /**
   * STEP 5: DUPLICATE SCAN DETECTION & LOGGING
   * 
   * If duplicate QR code scanned:
   * 1. Transaction detects checkedIn = true
   * 2. Returns 409 Conflict error
   * 3. Logs security incident
   * 4. Alert sent to event organizer
   * 
   * Log entry:
   * {
   *   eventId: "uuid",
   *   guestId: "uuid",
   *   qrToken: "masked-for-security",
   *   timestamp: "2026-06-15T14:06:00Z",
   *   type: "DUPLICATE_SCAN",
   *   severity: "WARNING",
   *   message: "Attempt to check in already verified guest"
   * }
   */
  step5_security_logging: {
    duplicate_scan: {
      response: "409 Conflict",
      message: "Guest already checked in"
    },
    logging: {
      captures: [
        "Event ID",
        "Guest ID (non-identifying)",
        "Timestamp",
        "Scan type (normal, duplicate, invalid)",
        "Organizer ID who scanned",
        "Device/scanner ID"
      ],
      creates_alert: "Host notified of duplicate scan attempt"
    }
  },

  /**
   * STEP 6: ORGANIZER FEEDBACK
   * 
   * Frontend app shows:
   * ✓ GREEN: Guest verified
   *   - "Welcome John Doe!"
   *   - Attendance updated: 118/150
   * 
   * ✗ RED: Already checked in
   *   - "John Doe already checked in at 2:05 PM"
   *   - Organizer can view guest details
   * 
   * ✗ RED: Invalid QR
   *   - "Invalid QR code"
   *   - "This guest may not be invited"
   */
  step6_organizer_feedback: {
    success: {
      color: "GREEN",
      message: "Welcome {guestName}!",
      details: "Attendance: 118/150 guests"
    },
    duplicate: {
      color: "RED/YELLOW",
      message: "{guestName} already checked in",
      details: "Checked in at 2:05 PM"
    },
    invalid: {
      color: "RED",
      message: "Invalid QR code",
      details: "Guest not found or not invited"
    }
  },

  /**
   * STEP 7: REAL-TIME DASHBOARD
   * 
   * GET /events/{eventId}/check-ins
   * 
   * Returns live check-in statistics
   * Updates every few seconds
   * 
   * Response:
   * {
   *   eventId: "uuid",
   *   totalInvited: 150,
   *   checkedIn: 118,
   *   pending: 32,
   *   checkInPercentage: 78.67,
   *   lastUpdate: "2026-06-15T14:07:00Z",
   *   recentCheckIns: [
   *     { name: "John Doe", time: "14:06:32", status: "CHECKED_IN" },
   *     { name: "Jane Smith", time: "14:05:15", status: "CHECKED_IN" }
   *   ]
   * }
   */
  step7_live_dashboard: {
    endpoint: "GET /events/{eventId}/check-ins",
    method: "READ (WebSocket for real-time)",
    security: "authMiddleware, authorize(HOST, ADMIN)",
    displays: [
      "Total invited count",
      "Check-in count",
      "Pending count",
      "Check-in percentage",
      "Recent check-ins (last 50)",
      "Real-time updates"
    ]
  },

  /**
   * STEP 8: GUEST LOOKUP (Manual Override)
   * 
   * If guest can't scan QR code:
   * 1. Organizer searches guest name
   * 2. Manually verifies guest
   * 3. System creates check-in record
   * 
   * GET /events/{eventId}/guests?search=John&limit=10
   */
  step8_manual_checkin: {
    endpoint: "POST /events/{eventId}/guests/{guestId}/manual-checkin",
    method: "MANUAL VERIFICATION",
    security: "authMiddleware, authorize(ADMIN, ORGANIZER)",
    use_case: "Guest forgot QR or phone died",
    requires: "Organizer ID verification and confirmation"
  }
};

export const QR_VERIFICATION_DIAGRAM = `
┌────────────────────────────────────────────────────────────────────────┐
│               QR CODE VERIFICATION ANTI-FRAUD FLOW                      │
└────────────────────────────────────────────────────────────────────────┘

BEFORE EVENT
═══════════════════════════════════════════════════════════════════════════

Step 1-2: QR GENERATION & DISTRIBUTION
┌────────────────────┐
│ Backend generates: │ → qrToken (permanent UUID)
│ - Permanent token  │ → eventCode (ABC-123-DEF)
│ - Dynamic TOTP     │ → TOTP (changes every 30s)
└────────────────────┘
        ↓
┌────────────────────┐
│ Frontend encodes   │ → QR shows: ABC-123-DEF-847392
│ QR code with       │ → Includes URL with qrToken
│ current TOTP       │
└────────────────────┘
        ↓
┌────────────────────┐
│ Guest receives     │ → Via email/SMS invitation
│ invitation + QR    │ → Saves QR screenshot for event
└────────────────────┘


DURING EVENT
═══════════════════════════════════════════════════════════════════════════

Step 3-4: VERIFICATION PROCESS
┌────────────────────┐
│ Guest at entrance  │ → Shows QR on phone
│ Organizer scans    │ → Captures qrToken
└────────────────────┘
        ↓

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃              BACKEND SECURITY CHECKS (ATOMIC)                    ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ CHECK 1: Valid QR Token?                                         ┃
┃   ✓ Pass → Continue                                              ┃
┃   ✗ Fail → 401 Unauthorized                                      ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ CHECK 2: Guest invited to this event?                            ┃
┃   ✓ Pass → Continue                                              ┃
┃   ✗ Fail → 404 Not Found                                         ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ CHECK 3: TOTP Valid? (Current ±1 step)                           ┃
┃   ✓ Pass → Continue                                              ┃
┃   ✗ Fail → 400 Bad Request ("Code expired, try again")           ┃
┃   Note: 30s window prevents clock skew attacks                   ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ CHECK 4: Already checked in? (ATOMIC)                            ┃
┃   ✓ NO → Lock row, set checkedIn=true, timestamp NOW()           ┃
┃   ✗ YES → 409 Conflict ("Already checked in at 2:05 PM")         ┃
┃   Lock prevents race conditions                                   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
        ↓

Step 6: ORGANIZER FEEDBACK
┌────────────────────┐
│ GREEN: ✓ Verified  │ → "Welcome John Doe!"
│        Attendance  │ → 118/150 guests
├────────────────────┤
│ RED: ✗ Duplicate   │ → "Already checked in at 2:05 PM"
├────────────────────┤
│ RED: ✗ Invalid     │ → "Invalid QR - Guest not invited"
└────────────────────┘
        ↓

Step 7: LIVE DASHBOARD
┌────────────────────┐
│ Real-time stats    │ → Total: 150, Checked: 118, Rate: 78.67%
│ Recent check-ins   │ → Last 50 guests listed
│ Updates every 5s   │ → WebSocket connection
└────────────────────┘


SECURITY FEATURES
═══════════════════════════════════════════════════════════════════════════

✓ TOTP (Time-based One-Time Password)
  - Regenerates every 30 seconds
  - Screenshot becomes useless after 30 seconds
  - ±1 step tolerance for clock drift

✓ ATOMIC TRANSACTION
  - Prevents duplicate check-ins
  - Database lock prevents race conditions
  - Exactly one successful check-in per guest

✓ SECURITY LOGGING
  - Duplicate scan attempts logged
  - Invalid token attempts tracked
  - Organizer alerted of suspicious activity

✓ EVENT CODE
  - Easy to read: ABC-123-DEF
  - Manual entry backup if QR scanner fails
  - Helps guests verify correct event
`;

export const ANTI_FRAUD_MEASURES = {
  totp_anti_screenshot: {
    method: "Time-based One-Time Password",
    regeneration: "Every 30 seconds",
    validity: "Current ± 1 step (60 seconds total)",
    prevents: "Screenshot reuse after 30 seconds"
  },
  atomic_checkin: {
    method: "Database transaction lock",
    prevents: "Double check-in, race conditions",
    guarantees: "Exactly one successful check-in per guest"
  },
  duplicate_scan_detection: {
    method: "Check existing checkedIn flag",
    response: "409 Conflict error",
    logging: "Security incident recorded"
  },
  manual_verification: {
    method: "Organizer can verify guest identity",
    backup: "Manual check-in if QR scanner fails",
    confirmation: "Requires organizer authentication"
  }
};
