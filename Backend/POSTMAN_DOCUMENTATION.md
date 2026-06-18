# MyGuestly AI — Full API Documentation

> **Base URL:** `https://myguestly-ai.onrender.com/api/v1`  
> **Local Dev URL:** `http://localhost:5000/api/v1`  
> **Auth Strategy:** Bearer Token (JWT) via `Authorization` header  
> **Refresh Token:** Stored in `HttpOnly` cookie named `refreshToken`  
> **Content-Type:** `application/json` on all requests with a body

---

## Standard Response Envelope

Every response from this API follows this consistent shape:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": { ... },
  "timestamp": "2026-06-14T12:00:00.000Z"
}
```

**Error responses** follow this shape:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["field-level error 1", "field-level error 2"],
  "timestamp": "2026-06-14T12:00:00.000Z"
}
```

**Paginated responses** include:

```json
{
  "success": true,
  "message": "...",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 54,
    "totalPages": 6
  }
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Resource created |
| `400` | Bad request / Validation error |
| `401` | Unauthenticated — token missing or invalid |
| `403` | Forbidden — valid token but insufficient permissions |
| `404` | Resource not found |
| `409` | Conflict (e.g. duplicate email) |
| `429` | Too many requests (rate limited) |
| `500` | Internal server error |

---

## Postman Setup (Environment Variables)

Create a Postman environment with these variables:

| Variable | Value |
|----------|-------|
| `BASE_URL` | `https://myguestly-ai.onrender.com/api/v1` |
| `ACCESS_TOKEN` | _(set automatically after login)_ |
| `EVENT_ID` | _(set from create event response)_ |
| `GUEST_ID` | _(set from invite guest response)_ |
| `MEDIA_ID` | _(set from register media response)_ |
| `MEMORY_ID` | _(set from create memory response)_ |
| `INVITATION_TOKEN` | _(set from invite guest response)_ |

In the **Tests** tab of your Login request, add this script to auto-set the token:

```javascript
const res = pm.response.json();
if (res.data?.accessToken) {
  pm.environment.set("ACCESS_TOKEN", res.data.accessToken);
}
```

---

---

#  COLLECTION 1 — Authentication

---

## 1.1 Register

**`POST /auth/register`**

Creates a new user account. Sends a verification email automatically.

**Auth required:** No

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "fullName": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "StrongPass123",
  "phone": "+2348012345678"
}
```

**Field Rules:**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `fullName` | string |  | min 3, max 100 chars |
| `email` | string |  | valid email format |
| `password` | string |  | min 8, max 64 chars |
| `phone` | string |  | optional |

**Success Response `201`:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "fullName": "Ada Lovelace",
      "email": "ada@example.com",
      "role": "HOST",
      "isVerified": false,
      "createdAt": "2026-06-14T12:00:00.000Z"
    },
    "accessToken": "eyJhbGci..."
  }
}
```

**Errors:**
- `400` — Validation failed (missing fields, weak password)
- `409` — Email already in use

---

## 1.2 Login

**`POST /auth/login`**

Authenticates a user. Returns an access token and sets the `refreshToken` HttpOnly cookie.

>  **Rate limited** — Maximum 10 login attempts per 15 minutes per IP.

**Auth required:** No

**Body:**
```json
{
  "email": "ada@example.com",
  "password": "StrongPass123"
}
```

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "fullName": "Ada Lovelace",
      "email": "ada@example.com",
      "role": "HOST",
      "isVerified": true
    },
    "accessToken": "eyJhbGci..."
  }
}
```

>  The `refreshToken` cookie is set automatically by the server. In Postman, ensure **"Automatically follow redirects"** and **cookie management** are enabled.

**Errors:**
- `400` — Invalid credentials
- `401` — Account not verified
- `429` — Rate limit exceeded

---

## 1.3 Refresh Token

**`POST /auth/refresh`**

Issues a new `accessToken` using the `refreshToken` cookie and invalidates the old access token.

**Auth required:** No (uses cookie)

**Headers:**
```
Authorization: Bearer <OLD_ACCESS_TOKEN>
Cookie: refreshToken=<refresh_token>
```

> In Postman, the cookie is sent automatically if you logged in using the same Postman session/environment.

**Body:** None

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGci..."
  }
}
```

**Errors:**
- `401` — Refresh token missing, expired, or revoked

---

## 1.4 Logout

**`POST /auth/logout`**

Invalidates the user's session. Blocklists the access token and clears the refresh cookie.

**Auth required:**  Yes

**Headers:**
```
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Body:** None

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 1.5 Get Current User (Me)

**`GET /auth/me`**

Returns the authenticated user's profile.

**Auth required:**  Yes

**Headers:**
```
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Body:** None

**Success Response `200`:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "uuid",
    "fullName": "Ada Lovelace",
    "email": "ada@example.com",
    "phone": "+2348012345678",
    "role": "HOST",
    "isVerified": true,
    "avatarUrl": null,
    "createdAt": "2026-06-14T12:00:00.000Z"
  }
}
```

---

## 1.6 Update Profile

**`PATCH /auth/profile`**

Updates the authenticated user's profile fields. All fields are optional.

**Auth required:**  Yes

**Headers:**
```
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "fullName": "Ada Byron",
  "phone": "+2348098765432",
  "avatarUrl": "https://example.com/avatar.png"
}
```

**Field Rules:**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `fullName` | string |  | min 3, max 100 chars |
| `phone` | string |  | optional |
| `avatarUrl` | string |  | valid URL |

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

---

## 1.7 Change Password

**`PATCH /auth/password`**

Changes the authenticated user's password.

**Auth required:**  Yes

**Headers:**
```
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "currentPassword": "StrongPass123",
  "newPassword": "NewStrongPass456"
}
```

**Field Rules:**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `currentPassword` | string |  | must match current password |
| `newPassword` | string |  | min 8 chars |

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Errors:**
- `400` — Current password incorrect

---

## 1.8 Verify Email

**`GET /auth/verify-email?token=<token>`**

Verifies a user's email using the token sent in the registration email.

**Auth required:** No

**Query Params:**
| Param | Type | Required |
|-------|------|----------|
| `token` | string |  |

**Example Request:**
```
GET /api/v1/auth/verify-email?token=eyJhbGci...
```

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

## 1.9 Forgot Password

**`POST /auth/forgot-password`**

Sends a password reset email. Always returns success regardless of whether the email exists (prevents user enumeration).

**Auth required:** No

**Body:**
```json
{
  "email": "ada@example.com"
}
```

**Success Response `200`:**
```json
{
  "success": true,
  "message": "If an account exists with that email, a password reset link has been sent."
}
```

---

## 1.10 Reset Password

**`POST /auth/reset-password`**

Resets a password using the reset token from the email link.

**Auth required:** No

**Body:**
```json
{
  "token": "eyJhbGci...",
  "newPassword": "NewStrongPass456"
}
```

**Field Rules:**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `token` | string |  | from reset email |
| `newPassword` | string |  | min 8 chars |

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Errors:**
- `400` — Token expired or invalid

---

## 1.11 Delete Account

**`DELETE /auth/account`**

Soft-deletes the authenticated user's account. Clears session and sends a deletion confirmation email.

**Auth required:**  Yes

**Headers:**
```
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Body:** None

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

---

#  COLLECTION 2 — Events

> All event routes require `Authorization: Bearer {{ACCESS_TOKEN}}` unless stated otherwise.

---

## 2.1 Create Event

**`POST /events`**

Creates a new event in `DRAFT` status. Only `HOST` role can create events.

**Auth required:**  Yes (HOST only)

**Body:**
```json
{
  "title": "The Grand Gala 2026",
  "description": "An evening of elegance and celebration",
  "eventCategory": "Gala",
  "venueName": "The Landmark Centre",
  "address": "Plot 2, Adeola Odeku Street, Victoria Island, Lagos",
  "location": "Lagos",
  "coverUrl": "https://res.cloudinary.com/your-cover.jpg",
  "themeAccent": "#6B5BFF",
  "rsvpDeadline": "2026-07-01T00:00:00.000Z",
  "startDate": "2026-07-10T18:00:00.000Z",
  "endDate": "2026-07-10T23:00:00.000Z",
  "maxGuests": 500
}
```

**Field Rules:**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `title` | string |  | min 3, max 200 |
| `description` | string |  | max 1000 |
| `eventCategory` | string |  | one of: `Wedding`, `Gala`, `Birthday`, `Corporate`, `Church` |
| `venueName` | string |  | min 3, max 200 |
| `address` | string |  | min 5, max 300 |
| `location` | string |  | min 3, max 200 |
| `coverUrl` | string |  | valid URL |
| `themeAccent` | string |  | hex color or preset name |
| `rsvpDeadline` | ISO date |  | must be **before** `startDate` |
| `startDate` | ISO date |  | must be **before** `endDate` |
| `endDate` | ISO date |  | must be **after** `startDate` |
| `maxGuests` | integer |  | 1–10000 |

**Success Response `201`:**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": "uuid",
    "title": "The Grand Gala 2026",
    "eventCode": "XKQZ91",
    "status": "DRAFT",
    "hostId": "uuid",
    "startDate": "2026-07-10T18:00:00.000Z",
    "endDate": "2026-07-10T23:00:00.000Z",
    "createdAt": "2026-06-14T12:00:00.000Z"
  }
}
```

---

## 2.2 List My Events

**`GET /events`**

Lists all events owned by the authenticated host. Supports filtering and pagination.

**Auth required:**  Yes

**Query Params:**
| Param | Type | Required | Default | Options |
|-------|------|----------|---------|---------|
| `page` | integer |  | `1` | |
| `limit` | integer |  | `10` | max 100 |
| `status` | string |  | all | `DRAFT`, `ACTIVE`, `ONGOING`, `COMPLETED` |

**Example:**
```
GET /api/v1/events?page=1&limit=10&status=ACTIVE
```

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Events retrieved",
  "data": [ { ...event }, { ...event } ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

## 2.3 Get Event by ID

**`GET /events/:eventId`**

Fetches a single event's full details. Publicly accessible.

**Auth required:** No

**Path Params:**
| Param | Description |
|-------|-------------|
| `eventId` | UUID of the event |

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Event retrieved",
  "data": {
    "id": "uuid",
    "title": "The Grand Gala 2026",
    "description": "...",
    "eventCategory": "Gala",
    "status": "ACTIVE",
    "eventCode": "XKQZ91",
    "startDate": "...",
    "endDate": "...",
    "maxGuests": 500,
    "host": { "id": "uuid", "fullName": "Ada Lovelace" }
  }
}
```

---

## 2.4 Update Event

**`PUT /events/:eventId`**

Updates an event. **Only works on `DRAFT` status events.** All body fields are optional.

**Auth required:**  Yes (HOST, event owner only)

**Body:**
```json
{
  "title": "Updated Event Title",
  "maxGuests": 600,
  "location": "Abuja"
}
```

> Any subset of the create-event fields may be sent. Only provided fields are updated.

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Event updated successfully",
  "data": { ...updatedEvent }
}
```

**Errors:**
- `400` — Cannot update a non-DRAFT event
- `403` — Not your event

---

## 2.5 Publish Event

**`POST /events/:eventId/publish`**

Transitions event from `DRAFT` → `ACTIVE`. Event becomes invitable.

**Auth required:**  Yes (HOST, event owner only)

**Body:** None

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Event published successfully",
  "data": { ...event, "status": "ACTIVE" }
}
```

---

## 2.6 Start Event

**`POST /events/:eventId/start`**

Transitions event from `ACTIVE` → `ONGOING`. Marks event as live/in-progress.

**Auth required:**  Yes (HOST, event owner only)

**Body:** None

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Event started",
  "data": { ...event, "status": "ONGOING" }
}
```

---

## 2.7 End Event

**`POST /events/:eventId/end`**

Transitions event from `ONGOING` → `COMPLETED`.

**Auth required:**  Yes (HOST, event owner only)

**Body:** None

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Event ended",
  "data": { ...event, "status": "COMPLETED" }
}
```

---

## 2.8 Delete Event

**`DELETE /events/:eventId`**

Permanently deletes an event. Only `DRAFT` or `COMPLETED` events can be deleted.

**Auth required:**  Yes (HOST, event owner only)

**Body:** None

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

**Errors:**
- `400` — Cannot delete an ACTIVE or ONGOING event

---

## 2.9 Get Event Capacity

**`GET /events/:eventId/capacity`**

Returns the capacity stats for an event.

**Auth required:** No

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Capacity info retrieved",
  "data": {
    "maxGuests": 500,
    "totalGuests": 120,
    "confirmedGuests": 85,
    "availableSpots": 380,
    "isFull": false
  }
}
```

---

## 2.10 Get Event Dashboard

**`GET /events/:eventId/dashboard`**

Returns full event statistics for the host dashboard.

**Auth required:**  Yes (HOST, event owner only)

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Dashboard retrieved",
  "data": {
    "event": { ...event },
    "stats": {
      "totalGuests": 120,
      "confirmed": 85,
      "pending": 30,
      "declined": 5,
      "checkedIn": 60,
      "totalMedia": 42,
      "totalMemories": 18
    }
  }
}
```

---

---

#  COLLECTION 3 — Guests & Invitations

---

## 3.1 Invite a Single Guest

**`POST /events/:eventId/guests`**

Invites a single guest to an event. Creates a guest record, generates a QR code, and enqueues an invitation email with a PDF ticket attachment.

**Auth required:**  Yes (HOST only)

**Body:**
```json
{
  "name": "Grace Hopper",
  "email": "grace@example.com",
  "phone": "08012345678"
}
```

**Field Rules:**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `name` | string |  | min 2, max 100 |
| `email` | string | * | valid email |
| `phone` | string | * | 10–15 digits |

>  At least one of `email` or `phone` must be provided.

**Success Response `201`:**
```json
{
  "success": true,
  "message": "Guest invited successfully",
  "data": {
    "guest": {
      "id": "uuid",
      "fullName": "Grace Hopper",
      "email": "grace@example.com",
      "phone": "08012345678"
    },
    "invitation": {
      "guestId": "uuid",
      "eventId": "uuid",
      "eventTitle": "The Grand Gala 2026",
      "eventCode": "XKQZ91",
      "token": "uuid-invitation-token",
      "invitationLink": "https://app.myguestly.com/rsvp/XKQZ91/uuid-token"
    },
    "existing": false,
    "mail": {
      "enqueued": true,
      "jobId": "bullmq-job-id"
    }
  }
}
```

>  The `invitation.token` is the QR token used for gate verification. The `invitationLink` is what the guest uses to RSVP. The email is sent asynchronously via the BullMQ worker.

---

## 3.2 Bulk Invite Guests

**`POST /events/:eventId/guests/bulk-invite`**

Invites multiple guests at once. Each guest gets an invitation email queued individually.

**Auth required:**  Yes (HOST only)

**Body:**
```json
{
  "guests": [
    {
      "name": "Grace Hopper",
      "email": "grace@example.com"
    },
    {
      "name": "Katherine Johnson",
      "phone": "08098765432"
    },
    {
      "name": "Dorothy Vaughan",
      "email": "dorothy@example.com",
      "phone": "09087654321"
    }
  ]
}
```

**Rules:**
- `guests` array: min 1 item required
- Each guest must have at least one of `email` or `phone`

**Success Response `201`:**
```json
{
  "success": true,
  "message": "Guest invitations created",
  "data": {
    "created": 3,
    "skipped": 0,
    "guests": [ ... ]
  }
}
```

---

## 3.3 List Guests

**`GET /events/:eventId/guests`**

Lists all guests for an event. Supports RSVP status filtering and pagination.

**Auth required:**  Yes (HOST only)

**Query Params:**
| Param | Type | Required | Default | Options |
|-------|------|----------|---------|---------|
| `page` | integer |  | `1` | |
| `limit` | integer |  | `10` | max 100 |
| `rsvpStatus` | string |  | all | `PENDING`, `CONFIRMED`, `DECLINED` |

**Example:**
```
GET /api/v1/events/:eventId/guests?page=1&limit=20&rsvpStatus=CONFIRMED
```

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Guest list retrieved",
  "data": [
    {
      "id": "uuid",
      "fullName": "Grace Hopper",
      "email": "grace@example.com",
      "invitation": {
        "status": "PENDING",
        "token": "uuid-token",
        "sentAt": "2026-06-14T12:00:00.000Z"
      }
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 45, "totalPages": 5 }
}
```

---

## 3.4 Update Guest RSVP

**`PUT /events/:eventId/guests/:guestId/rsvp`**

Updates a guest's RSVP status. This is typically triggered when a guest clicks the link in their invitation email.

**Auth required:** No (publicly accessible — guests can update their own RSVP via their invitation link)

**Body:**
```json
{
  "status": "CONFIRMED"
}
```

**Field Rules:**
| Field | Type | Required | Options |
|-------|------|----------|---------|
| `status` | string |  | `PENDING`, `CONFIRMED`, `DECLINED` |

**Success Response `200`:**
```json
{
  "success": true,
  "message": "RSVP status updated",
  "data": {
    "guestId": "uuid",
    "status": "CONFIRMED",
    "updatedAt": "..."
  }
}
```

**Errors:**
- `400` — Event is at capacity (when confirming)
- `404` — Guest not found

---

---

#  COLLECTION 4 — QR Gate Verification

---

## 4.1 Verify QR at Gate

**`POST /verify-gate/:token`**

The gate scanner submits this request when a guest presents their QR code. Performs TOTP verification and atomically checks the guest in. On success, fires a real-time Socket.io event to the host's dashboard.

**Auth required:** No

**Path Params:**
| Param | Description |
|-------|-------------|
| `token` | The invitation token from the guest's QR code |

**Body:**
```json
{
  "totp": "482917"
}
```

**Field Rules:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `totp` | string |  | 6-digit time-based one-time code (changes every 30s) |

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Check-in successful",
  "data": {
    "guestId": "uuid",
    "eventId": "uuid"
  }
}
```

**Error Responses:**
```json
// Duplicate scan
{
  "success": false,
  "message": "This code has already been used (possible fraud)"
}

// Invalid TOTP
{
  "success": false,
  "message": "Invalid or expired code"
}

// Invitation not found
{
  "success": false,
  "message": "Invitation not found"
}
```

>  **How the QR flow works end-to-end:**
> 1. Guest receives invitation email with a `ticket.pdf` attached
> 2. The PDF contains a static QR code encoding the `invitation.token`
> 3. The gate scanner app reads the QR → derives a 6-digit TOTP from the token (rotating every 30 seconds)
> 4. Scanner calls `POST /verify-gate/:token` with `{ totp }` 
> 5. Backend verifies the TOTP and atomically creates a `CheckIn` record
> 6. Host dashboard receives a `guestCheckedIn` Socket.io event in real-time

>  Any second scan of the same token returns `400` and creates a `QR_SCANNED` notification for the host automatically.

---

---

#  COLLECTION 5 — Media Gallery

---

## 5.1 Get Upload Signature

**`GET /events/:eventId/media/upload-url`**

Generates a Cloudinary pre-signed upload signature. The frontend uses this signature to upload files **directly to Cloudinary** — the file never passes through the backend server.

**Auth required:**  Yes

**Body:** None

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Upload signature generated",
  "data": {
    "uploadUrl": "https://api.cloudinary.com/v1_1/your-cloud/auto/upload",
    "signature": "abc123...",
    "timestamp": 1718360000,
    "apiKey": "366573173118126",
    "cloudName": "your-cloud-name",
    "folder": "myguestly-ai/events/uuid"
  }
}
```

>  **Frontend Upload Flow:**
> 1. Call this endpoint to get the signature
> 2. Make a `multipart/form-data` POST directly to Cloudinary's `uploadUrl` with fields: `file`, `signature`, `timestamp`, `api_key`, `folder`
> 3. Cloudinary returns a response with `secure_url` and `public_id`
> 4. Call **5.2 Register Media** with those values to save them to the database

---

## 5.2 Register Uploaded Media

**`POST /events/:eventId/media`**

Registers a media file that was already uploaded to Cloudinary. Saves the URL and metadata to the database, then enqueues a background job to generate compressed variants and extract metadata.

**Auth required:**  Yes

**Body:**
```json
{
  "mediaType": "IMAGE",
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v1718360000/myguestly-ai/events/uuid/photo.jpg",
  "publicId": "myguestly-ai/events/uuid/photo",
  "caption": "Such a lovely moment!"
}
```

**Field Rules:**
| Field | Type | Required | Options |
|-------|------|----------|---------|
| `mediaType` | string |  | `IMAGE`, `VIDEO` |
| `url` | string |  | valid Cloudinary URL |
| `publicId` | string |  | from Cloudinary upload response (recommended) |
| `caption` | string |  | max 500 chars |

**Success Response `201`:**
```json
{
  "success": true,
  "message": "Media uploaded successfully",
  "data": {
    "id": "uuid",
    "url": "https://res.cloudinary.com/...",
    "publicId": "myguestly-ai/events/uuid/photo",
    "mediaType": "IMAGE",
    "aiStatus": "PENDING",
    "metadata": { "caption": "Such a lovely moment!" },
    "createdAt": "2026-06-14T12:00:00.000Z"
  }
}
```

>  `aiStatus` starts as `PENDING`. The background worker updates it to `APPROVED` once compression and metadata extraction are complete.

---

## 5.3 Get Media Gallery

**`GET /events/:eventId/media`**

Lists all media for an event. Supports type filtering and pagination. Each item includes comment/like counts.

**Auth required:** Optional (guests with a link can view)

**Query Params:**
| Param | Type | Required | Default | Options |
|-------|------|----------|---------|---------|
| `page` | integer |  | `1` | |
| `limit` | integer |  | `10` | max 100 |
| `mediaType` | string |  | all | `IMAGE`, `VIDEO` |

**Example:**
```
GET /api/v1/events/:eventId/media?page=1&limit=20&mediaType=IMAGE
```

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Media retrieved",
  "data": [
    {
      "id": "uuid",
      "url": "https://res.cloudinary.com/...",
      "mediaType": "IMAGE",
      "voiceNoteUrl": null,
      "metadata": {
        "caption": "Great shot!",
        "variants": [...],
        "exif": {...}
      },
      "uploader": {
        "id": "uuid",
        "fullName": "Ada Lovelace",
        "avatarUrl": null
      },
      "_count": {
        "comments": 3,
        "likes": 12
      }
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

---

## 5.4 Add Voice Note to Media

**`POST /events/:eventId/media/:mediaId/voice-note`**

Attaches a voice note audio URL to an existing media item.

**Auth required:**  Yes

**Body:**
```json
{
  "voiceNoteUrl": "https://res.cloudinary.com/.../voice_note.mp3"
}
```

**Field Rules:**
| Field | Type | Required |
|-------|------|----------|
| `voiceNoteUrl` | string (URL) |  |

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Voice note added successfully",
  "data": { ...updatedMedia }
}
```

---

## 5.5 Add Comment to Media

**`POST /events/:eventId/media/:mediaId/comments`**

Posts a comment on a media item.

**Auth required:**  Yes

**Body:**
```json
{
  "content": "What a beautiful shot! 😍"
}
```

**Field Rules:**
| Field | Type | Required |
|-------|------|----------|
| `content` | string |  |

**Success Response `201`:**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "id": "uuid",
    "content": "What a beautiful shot! 😍",
    "author": {
      "id": "uuid",
      "fullName": "Ada Lovelace",
      "avatarUrl": null
    },
    "createdAt": "2026-06-14T12:00:00.000Z"
  }
}
```

---

## 5.6 Toggle Like on Media

**`POST /events/:eventId/media/:mediaId/likes`**

Toggles a like on a media item. Calling it once likes it; calling it again unlikes it.

**Auth required:**  Yes

**Body:** None

**Success Response `200`:**
```json
// When liked
{
  "success": true,
  "message": "Media liked",
  "data": { "liked": true }
}

// When unliked
{
  "success": true,
  "message": "Media unliked",
  "data": { "liked": false }
}
```

---

---

#  COLLECTION 6 — Memories

---

## 6.1 Create Memory

**`POST /events/:eventId/memories`**

Lets a guest or user leave a text or voice memory for the event.

**Auth required:**  Yes

**Body:**
```json
{
  "content": "This was the most beautiful wedding I've ever attended. Thank you!",
  "type": "TEXT"
}
```

For a voice memory:
```json
{
  "content": "Voice memory from Grace",
  "type": "VOICE",
  "mediaUrl": "https://res.cloudinary.com/.../voice_memory.mp3"
}
```

**Field Rules:**
| Field | Type | Required | Options |
|-------|------|----------|---------|
| `content` | string |  | max 1000 chars |
| `type` | string |  | `TEXT` (default), `VOICE` |
| `mediaUrl` | string |  | required when `type` is `VOICE` |

**Success Response `201`:**
```json
{
  "success": true,
  "message": "Memory added successfully",
  "data": {
    "id": "uuid",
    "type": "TEXT",
    "content": "This was the most beautiful wedding...",
    "audioUrl": null,
    "author": {
      "id": "uuid",
      "fullName": "Grace Hopper",
      "avatarUrl": null
    },
    "createdAt": "2026-06-14T12:00:00.000Z"
  }
}
```

---

## 6.2 Get Memory Feed

**`GET /events/:eventId/memories`**

Returns the memory timeline for an event, ordered by newest first.

**Auth required:** Optional

**Query Params:**
| Param | Type | Required | Default | Options |
|-------|------|----------|---------|---------|
| `page` | integer |  | `1` | |
| `limit` | integer |  | `10` | max 100 |
| `type` | string |  | all | `TEXT`, `VOICE` |

**Example:**
```
GET /api/v1/events/:eventId/memories?page=1&limit=10&type=TEXT
```

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Memories retrieved",
  "data": [
    {
      "id": "uuid",
      "type": "TEXT",
      "content": "Thank you for the amazing night!",
      "audioUrl": null,
      "author": {
        "id": "uuid",
        "fullName": "Katherine Johnson",
        "avatarUrl": null
      },
      "createdAt": "2026-06-14T12:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 18, "totalPages": 2 }
}
```

---

---

# 📡 Real-Time Events (Socket.io)

The backend uses Socket.io for real-time updates. Connect to the root of the API server (not `/api/v1`).

**Connection URL:** `wss://your-render-url.onrender.com`

---

## Socket Events

### Emitting (Client → Server)

| Event | Payload | Description |
|-------|---------|-------------|
| `joinEventRoom` | `eventId` (string) | Join the room to receive real-time updates for a specific event |
| `leaveEventRoom` | `eventId` (string) | Leave the event room |

**Example (JavaScript):**
```javascript
import { io } from "socket.io-client";

const socket = io("https://your-render-url.onrender.com");

// Join event room to receive real-time check-ins
socket.emit("joinEventRoom", "event-uuid-here");

// Listen for guest check-ins
socket.on("guestCheckedIn", (data) => {
  console.log("Guest just checked in!", data);
  // { guestId, eventId, checkedAt }
});
```

### Listening (Server → Client)

| Event | Payload | Trigger |
|-------|---------|---------|
| `guestCheckedIn` | `{ guestId, eventId, checkedAt }` | Fired when a guest successfully scans QR at the gate |

---

---

# 🔒 Security Notes for Frontend

1. **Never store the `accessToken` in `localStorage`** — use memory (React state/context) or a `sessionStorage` fallback.
2. **The `refreshToken` is HttpOnly cookie** — it is automatically sent by the browser. Never try to read or manually attach it.
3. **Call `POST /auth/refresh`** when you receive a `401` response to get a fresh access token. Implement an Axios interceptor for this.
4. **All media uploads go directly to Cloudinary** — never send files to the backend API. Use the signature from endpoint **5.1** and upload directly.
5. **Socket.io rooms are event-scoped** — only join the room for events the authenticated host owns. The `guestCheckedIn` event is live-streamed into that room.

---

#  Common Error Scenarios

| Scenario | What to do |
|----------|------------|
| `401 Unauthorized` | Call `/auth/refresh` to get a new token. If that also fails, redirect to login. |
| `403 Forbidden` | User is authenticated but doesn't have permission (e.g. not the event owner). |
| `400` on event create | Check date validation — `rsvpDeadline` must be before `startDate`, `startDate` before `endDate`. |
| `400` on guest invite | Make sure at least one of `email` or `phone` is provided. |
| `400` on QR scan | Either the TOTP is expired (wait 30s and retry) or the guest already checked in. |
| `429 Too Many Requests` | Login rate limited. Wait 15 minutes before retrying. |
