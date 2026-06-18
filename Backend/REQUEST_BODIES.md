# MyGuestly API Request Bodies and Headers

This file documents the request bodies, query parameters, and auth requirements for the current backend routes.

## Base URL

All routes are mounted under:

```text
/api/v1
```

## Common headers

### Authentication header

For protected routes:

```http
Authorization: Bearer <access_token>
```

### Cookie-based refresh token

The refresh endpoint uses the `refreshToken` cookie. The login and refresh flows set it automatically.

---

## 1. Health

### GET /api/v1/health

No auth required.

No body.

---

## 2. Authentication routes

### POST /api/v1/auth/register

Creates a new user account.

Body:

```json
{
  "fullName": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "StrongPass123",
  "phone": "+2348012345678"
}
```

Fields:
- fullName: required
- email: required, must be a valid email
- password: required, minimum length 8
- phone: optional

Response:
- returns a new user object and access token

---

### POST /api/v1/auth/login

Authenticates an existing user.

Body:

```json
{
  "email": "ada@example.com",
  "password": "StrongPass123"
}
```

Fields:
- email: required
- password: required

Response:
- returns the authenticated user and access token
- also sets the refreshToken cookie

---

### POST /api/v1/auth/refresh

Refreshes an access token using the refresh token cookie.

Headers:
- Cookie: refreshToken=<refresh_token>
- Authorization: Bearer <old_access_token> (required for blocklisting the previous token)

No body.

---

### POST /api/v1/auth/forgot-password

Requests a password reset email.

Body:

```json
{
  "email": "ada@example.com"
}
```

---

### POST /api/v1/auth/reset-password

Resets the password using a reset token.

Body:

```json
{
  "token": "<reset-token>",
  "newPassword": "NewStrongPass123"
}
```

---

### GET /api/v1/auth/verify-email

Verifies a user email address.

Query params:

```text
?token=<email-verification-token>
```

---

### GET /api/v1/auth/me

Returns the authenticated user profile.

Auth required.

No body.

---

### POST /api/v1/auth/logout

Logs the current user out and invalidates the session.

Auth required.

No body.

---

### PATCH /api/v1/auth/profile

Updates the authenticated user profile.

Auth required.

Body:

```json
{
  "fullName": "Ada Byron",
  "phone": "+2348098765432",
  "avatarUrl": "https://example.com/avatar.png"
}
```

Fields:
- fullName: optional
- phone: optional
- avatarUrl: optional

---

### PATCH /api/v1/auth/password

Changes the authenticated user password.

Auth required.

Body:

```json
{
  "currentPassword": "StrongPass123",
  "newPassword": "NewStrongPass123"
}
```

---

### DELETE /api/v1/auth/account

Soft-deletes the current user account.

Auth required.

No body.

---

## 3. Event routes

### POST /api/v1/events

Creates a new event.

Auth required.

Body:

```json
{
  "title": "Birthday Bash",
  "description": "A fun evening celebration",
  "eventCategory": "Birthday",
  "venueName": "The Grand Hall",
  "address": "12 Kings Road, Lagos",
  "coverUrl": "https://example.com/cover.jpg",
  "themeAccent": "#FF6B6B",
  "rsvpDeadline": "2026-06-20T00:00:00.000Z",
  "startDate": "2026-06-25T18:00:00.000Z",
  "endDate": "2026-06-25T23:00:00.000Z",
  "location": "Lagos",
  "maxGuests": 300
}
```

Fields:
- title: required
- description: optional
- eventCategory: required, one of (Wedding, Gala, Birthday, Corporate, Church etc.)
- venueName: required
- address: required
- coverUrl: optional
- themeAccent: optional
- rsvpDeadline: optional, ISO date
- startDate: required, ISO date
- endDate: required, ISO date
- location: optional
- maxGuests: required

---

### GET /api/v1/events

Lists events for the authenticated host.

Auth required.

Query params:

```text
?page=1&limit=10&status=DRAFT
```

Supported status values:
- DRAFT
- ACTIVE
- ONGOING
- COMPLETED

---

### GET /api/v1/events/:eventId

Fetches a single event.

No auth required for public event reads.

No body.

---

### PUT /api/v1/events/:eventId

Updates an existing event.

Auth required.

Body:

```json
{
  "title": "Updated Event Title",
  "location": "Abuja",
  "maxGuests": 500
}
```

Any subset of the create-event fields may be included.

---

### POST /api/v1/events/:eventId/publish

Publishes an event.

Auth required.

No body.

---

### POST /api/v1/events/:eventId/start

Marks an event as ongoing.

Auth required.

No body.

---

### POST /api/v1/events/:eventId/end

Marks an event as completed.

Auth required.

No body.

---

### DELETE /api/v1/events/:eventId

Deletes an event.

Auth required.

No body.

---

### GET /api/v1/events/:eventId/capacity

Returns capacity-related information for an event.

No body.

---

### GET /api/v1/events/:eventId/dashboard

Returns event dashboard stats for the event owner.

Auth required.

No body.

---

## 4. Guest routes

### POST /api/v1/events/:eventId/guests

Invites a single guest to an event.

Auth required.

Body:

```json
{
  "fullName": "Grace Hopper",
  "email": "grace@example.com",
  "phone": "08012345678"
}
```

Rules:
- either email or phone must be present
- fullName is required

---

### POST /api/v1/events/:eventId/guests/bulk-invite

Invites multiple guests at once.

Auth required.

Body:

```json
{
  "guests": [
    {
      "fullName": "Grace Hopper",
      "email": "grace@example.com"
    },
    {
      "fullName": "Katherine Johnson",
      "phone": "08098765432"
    }
  ]
}
```

---

### GET /api/v1/events/:eventId/guests

Lists guests for an event.

Auth required.

Query params:

```text
?page=1&limit=10&rsvpStatus=CONFIRMED
```

Supported RSVP statuses:
- PENDING
- CONFIRMED
- DECLINED

---

### PUT /api/v1/events/:eventId/guests/:guestId/rsvp

Updates a guest RSVP status.

Body:

```json
{
  "status": "CONFIRMED"
}
```

---

## 5. QR verification route

### POST /api/v1/verify-gate/:token

Performs QR-based gate verification and check-in.

Body:

```json
{
  "totp": "123456"
}
```

Path params:
- token: invitation token associated with the guest

This route verifies the QR/TOTP flow and marks the guest as checked in if the code is valid and not already used.

---

---

## 6. Media routes

### GET /api/v1/events/:eventId/media/upload-url

Generates a pre-signed Cloudinary upload URL and signature.

Auth required.

No body.

---

### POST /api/v1/events/:eventId/media

Registers a newly uploaded media file to the event's gallery and enqueues background processing.

Auth required.

Body:

```json
{
  "mediaType": "IMAGE",
  "url": "https://res.cloudinary.com/...",
  "publicId": "myguestly-ai/events/...",
  "caption": "Such a lovely moment!"
}
```

Fields:
- mediaType: required ("IMAGE" or "VIDEO")
- url: required
- publicId: optional (but highly recommended for background processing)
- caption: optional

---

### GET /api/v1/events/:eventId/media

Lists the media gallery for an event.

Optional auth (can be viewed by guests).

Query params:

```text
?page=1&limit=10&mediaType=IMAGE
```

---

### POST /api/v1/events/:eventId/media/:mediaId/voice-note

Attaches a voice note to an existing media item.

Auth required.

Body:

```json
{
  "voiceNoteUrl": "https://..."
}
```

---

### POST /api/v1/events/:eventId/media/:mediaId/comments

Adds a comment to an existing media item.

Auth required.

Body:

```json
{
  "content": "Wow, what a great picture!"
}
```

---

### POST /api/v1/events/:eventId/media/:mediaId/likes

Toggles a like on a media item.

Auth required.

No body.

---

## 7. Memories routes

### POST /api/v1/events/:eventId/memories

Leaves a text or voice memory for the event host.

Auth required.

Body:

```json
{
  "content": "Thanks for the amazing party!",
  "type": "TEXT",
  "mediaUrl": "https://..."
}
```

Fields:
- content: required for TEXT
- type: optional (defaults to "TEXT", can be "VOICE")
- mediaUrl: required if type is "VOICE"

---

### GET /api/v1/events/:eventId/memories

Lists the timeline of memories for an event.

Optional auth.

Query params:

```text
?page=1&limit=10&type=TEXT
```

---

## 8. Notes

- All successful responses follow a consistent JSON envelope with `success`, `message`, `data`, `errors`, and `timestamp`.
- Validation errors return HTTP 400 with structured details.
- Auth failures return HTTP 401.
- Authorization failures return HTTP 403.
- Resource not found errors return HTTP 404.
