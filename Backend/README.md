# MyGuestly AI — Backend Documentation

MyGuestly is a full-stack event hosting and guest experience platform. The backend service is built with Node.js, Express, Prisma, PostgreSQL, Redis, BullMQ, and Winston. It powers user authentication, event management, guest invitations, QR-based gate verification, structured logging, and asynchronous email delivery.

This document is a practical reference for the current implementation, including the security layer, configuration approach, authentication module, mail/queue system, Docker setup, and the latest logging improvements.

---

## 1. What the backend does

The backend currently supports:

- Secure user registration, login, refresh, logout, profile updates, password changes, and account deletion
- Email verification, password-reset flows, and account lifecycle notifications
- Event creation, publishing, lifecycle transitions, and host-level dashboards
- Guest invitation and bulk invitation workflows
- RSVP updates and guest management
- QR gate verification with anti-duplicate check-in protection
- Redis-backed rate limiting and token hardening
- Structured logging for auth, event, invitation, QR, queue, and worker activity
- Docker-based development and deployment for API, worker, PostgreSQL, Redis, Prisma Studio, and NGINX

---

## 2. Technology stack

- Runtime: Node.js 22
- Framework: Express 5
- Database: PostgreSQL via Prisma ORM
- Cache/queue: Redis + BullMQ
- Authentication: JWT + Redis token storage + blocklist checks
- Validation: Zod for auth routes, Joi for event/guest validation
- Email: Nodemailer with queue-based delivery
- Logging: Winston
- Security: Helmet, CORS, cookie parsing, rate limiting
- Containerization: Docker + Docker Compose

---

## 3. Request lifecycle

Every request follows a consistent path:

1. The Express app boots from [src/app.js](src/app.js).
2. Security middleware runs first: Helmet, CORS, cookie parsing, request logging, and rate limiting.
3. Authentication middleware protects private routes.
4. Request validation runs before the controller layer.
5. Controllers delegate to service modules.
6. Services interact with Prisma, Redis, or the queue layer.
7. Errors are normalized by the centralized error middleware.
8. Structured logs are emitted for important outcomes and failures.

---

## 4. Project structure

```text
Backend/
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.api
│   └── Dockerfile.worker
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app.js
│   ├── config/
│   │   ├── cors.js
│   │   ├── env.js
│   │   ├── prisma.js
│   │   └── redis.js
│   ├── infra/
│   │   ├── email/
│   │   ├── logs/
│   │   └── queues/
│   ├── middlewares/
│   ├── modules/
│   │   ├── auth/
│   │   ├── events/
│   │   ├── guests/
│   │   └── verification/
│   ├── orchestration/
│   ├── routes/
│   └── shared/
│       └── utils/
└── logs/
```

Key responsibilities:

- [src/middlewares](src/middlewares) — authentication, authorization, validation, request logging, rate limiting, and error handling
- [src/modules](src/modules) — feature modules for auth, events, guests, and verification
- [src/infra](src/infra) — email transport, queues, workers, and logging infrastructure
- [src/shared/utils](src/shared/utils) — shared response helpers, token utilities, password utilities, and Prisma/QR helpers
- [src/orchestration](src/orchestration) — workflow helpers for registration and verification workflows

---

## 5. Security middleware and request protection

The backend takes a layered approach to security.

### Helmet and CORS
- [src/app.js](src/app.js) enables Helmet for standard security headers.
- [src/config/cors.js](src/config/cors.js) controls cross-origin access for the frontend and local tools.

### Request logging
- Incoming requests are logged through the request logger middleware.
- Error events are also captured and routed into the logging pipeline.

### Rate limiting
- [src/middlewares/rateLimitMiddleware.js](src/middlewares/rateLimitMiddleware.js) uses Redis-backed rate limiting.
- The general API limiter protects all endpoints.
- A login-specific limiter is enforced on authentication attempts to reduce brute-force risk.

### Authentication and authorization
- [src/middlewares/authenticateMiddleware.js](src/middlewares/authenticateMiddleware.js) verifies bearer tokens and checks Redis for blocklisted tokens.
- [src/middlewares/authorizeMiddleware.js](src/middlewares/authorizeMiddleware.js) ensures role-based access for host-only features.

### Validation
- Auth route validation is handled with Zod in [src/modules/auth/authValidation.js](src/modules/auth/authValidation.js).
- Event and guest validations are handled with Joi schemas in [src/shared/utils/validationSchemas.js](src/shared/utils/validationSchemas.js).

### Error handling
- [src/middlewares/errorMiddleware.js](src/middlewares/errorMiddleware.js) normalizes thrown errors into consistent API responses.
- Shared response helpers live in [src/shared/utils/ApiResponse.js](src/shared/utils/ApiResponse.js).

---

## 6. Configuration and environment variables

The environment configuration is strictly validated in [src/config/env.js](src/config/env.js) using Zod.

Required variables include:

- Core runtime
  - PORT
  - NODE_ENV
  - DATABASE_URL
  - REDIS_URL

- JWT settings
  - JWT_SECRET
  - JWT_REFRESH_SECRET
  - JWT_ACCESS_EXPIRES_IN
  - JWT_REFRESH_EXPIRES_IN
  - JWT_EMAIL_VERIFICATION_SECRET
  - JWT_PASSWORD_RESET_SECRET

- Application URLs and CORS
  - ALLOWED_ORIGINS
  - APP_CLIENT_URL
  - APP_API_URL

- Mail settings
  - EMAIL_HOST
  - EMAIL_PORT
  - EMAIL_SERVICE_USER
  - EMAIL_SERVICE_PASS

- Cloud storage placeholders
  - CLOUDINARY_CLOUD_NAME
  - CLOUDINARY_API_KEY
  - CLOUDINARY_API_SECRET

The app will fail fast if critical env values are missing or malformed.

---

## 7. Helpers and shared utilities

The shared utilities layer keeps the codebase consistent and reusable.

### Token utilities
- [src/shared/utils/tokenUtils.js](src/shared/utils/tokenUtils.js) generates access tokens, refresh tokens, email verification tokens, and password-reset tokens.

### Password utilities
- [src/shared/utils/passwordUtil.js](src/shared/utils/passwordUtil.js) handles password hashing and comparison using bcrypt.

### Response helpers
- [src/shared/utils/ApiResponse.js](src/shared/utils/ApiResponse.js) standardizes success, error, and paginated responses.

### Error handling
- [src/shared/utils/AppError.js](src/shared/utils/AppError.js) contains custom application errors with consistent status codes.

### QR and utility helpers
- [src/shared/utils/helpers.js](src/shared/utils/helpers.js) includes QR token generation, event code generation, TOTP generation/verification, and utility helpers for emails and phone numbers.

### Logging
- [src/infra/logs/logger.js](src/infra/logs/logger.js) uses Winston and writes to the console plus log files for combined, error, exception, and rejection events.

---

## 8. Authentication module

The auth flow is organized across:

- [src/modules/auth/authRoutes.js](src/modules/auth/authRoutes.js)
- [src/modules/auth/authController.js](src/modules/auth/authController.js)
- [src/modules/auth/authService.js](src/modules/auth/authService.js)
- [src/modules/auth/authValidation.js](src/modules/auth/authValidation.js)

### Supported auth actions

- Register a user
- Log in and receive access/refresh tokens
- Refresh tokens using the refresh cookie and old access token
- Logout and invalidate the user session
- Retrieve the current profile
- Update profile information
- Change password
- Request a reset link
- Reset password with a token
- Delete an account (soft-delete flow)

### Auth security behavior

- Refresh tokens are stored in Redis and rotated on refresh.
- Old access tokens are blocklisted until expiry after logout or refresh.
- Login attempts are rate-limited.
- Authenticated actions require the bearer token middleware.

---

## 9. Events, guests, and QR verification

### Event module
The event module is handled by [src/modules/events/eventService.js](src/modules/events/eventService.js) and [src/modules/events/eventController.js](src/modules/events/eventController.js).

Supported flows include:
- Create a new event with a generated event code
- List events for the authenticated host
- Read event details and stats
- Update event information
- Publish/start/end/delete event status transitions
- View capacity and dashboard data

### Guest module
The guest module is handled by [src/modules/guests/guestService.js](src/modules/guests/guestService.js) and [src/modules/guests/GuestController.js](src/modules/guests/GuestController.js).

Supported flows include:
- Invite a guest to an event
- Bulk invite a list of guests
- List guests for an event
- Update RSVP status
- Queue invitation emails for delivery

### QR verification and gate check-in
The QR verification workflow is handled by [src/modules/verification/verifyController.js](src/modules/verification/verifyController.js) and [src/orchestration/QRVerificationWorkflow.js](src/orchestration/QRVerificationWorkflow.js).

Key capabilities:
- Validate a one-time check-in token
- Verify a time-based QR code using TOTP logic
- Prevent duplicate scans and double check-ins
- Create an audit check-in record for successful scans
- Emit structured logs for successful and rejected check-ins

---

## 10. Email sending and async workers

The email pipeline is built for reliability and separation of concerns.

### Email transport

- [src/infra/email/emailService.js](src/infra/email/emailService.js) owns the SMTP transport layer.
- Mail delivery is centralized so other modules can send mail without directly touching SMTP details.

### Queue layer

- [src/infra/queues/emailQueue.js](src/infra/queues/emailQueue.js) creates a BullMQ queue named `email`.
- The queue uses Redis-backed job persistence and retry strategy.

### Worker layer

- [src/infra/queues/workers/emailWorker.js](src/infra/queues/workers/emailWorker.js) processes jobs for:
  - verification emails
  - password reset emails
  - account deletion emails
  - invitation emails

### Job behavior

- Jobs support retries with exponential backoff.
- Queue failures and worker failures are logged.
- Invitation emails are queued as soon as guest invitations are created.

---

## 11. Logging and observability

Structured logging was added to make the platform easier to debug and monitor in development and production.

### Current log coverage

- User registration and restoration
- User deletion
- Authentication failures and successful auth
- Event creation
- Invitation sending and queueing
- QR check-in success and rejection
- Worker job completion and failure
- Queue retry attempts

### Log destinations

- Console output
- [logs/combined.log](logs/combined.log)
- [logs/error.log](logs/error.log)
- [logs/exceptions.log](logs/exceptions.log)
- [logs/rejections.log](logs/rejections.log)

---

## 12. Dockerization

The application is fully containerized for local development and service orchestration.

### Containers

- API service
- Email worker service
- PostgreSQL service
- Redis service
- Prisma Studio service
- NGINX service

### Docker Compose setup

The main compose file is [docker/docker-compose.yml](docker/docker-compose.yml).

It exposes:

- API at http://localhost:5003
- Prisma Studio at http://localhost:5555
- NGINX at http://localhost:80
- PostgreSQL at localhost:5432
- Redis at localhost:6379

### Dockerfiles

- [docker/Dockerfile.api](docker/Dockerfile.api)
- [docker/Dockerfile.worker](docker/Dockerfile.worker)

### Typical startup

```bash
cd Backend
cp .env.example .env
docker compose -f docker/docker-compose.yml up --build
```

---

## 13. Local development

### Install dependencies

```bash
cd Backend
npm install
```

### Generate Prisma client

```bash
npm run generate
```

### Start the API locally

```bash
npm run dev
```

### Start the email worker

The worker is started via Docker Compose in the main stack, but it can also be launched from the worker entrypoint when required by the runtime environment.

---

## 14. Troubleshooting

### Prisma issues

- Run `npx prisma generate` if the Prisma client is missing or outdated.
- Run `npx prisma migrate deploy` if migrations have not been applied.

### Redis or queue issues
- Ensure Redis is reachable from the API and worker containers.
- Review queue and worker logs when jobs fail to process.

### Auth issues
- Check that the JWT secrets are populated in the environment file.
- Confirm the access token is sent in the `Authorization: Bearer ...` header.

### Docker issues
- Ensure ports 5003, 5432, 6379, 5555, and 80 are free.
- Rebuild containers when dependency or Dockerfile changes are made.

---

## 15. API reference note

The API base path is `/api/v1`.

For a full endpoint-by-endpoint request body and header reference, see [REQUEST_BODIES.md](REQUEST_BODIES.md).

- Returns:
  - new `accessToken`
  - new `refreshToken`
- Updates cookie `refreshToken`.

4) `POST /auth/forgot-password`
- Validated by `forgotPasswordSchema`
- If user exists, sends reset email
- Always returns success message to avoid user enumeration

5) `POST /auth/reset-password`
- Validated by `resetPasswordSchema`
- Verifies token using `env.JWT_PASSWORD_RESET_SECRET`
- Updates password hash
- Clears refresh tokens in Redis for that user (`redis.del(refresh:${user.id})`)

6) `GET /auth/verify-email?token=...`
- Verifies verification token using `env.JWT_EMAIL_VERIFICATION_SECRET`
- Marks `isVerified: true`

#### Protected routes (use `authenticate` middleware)

7) `GET /auth/me`
- Returns current user profile
- Rejects if account soft-deleted

8) `POST /auth/logout`
- Requires access token
- Deletes refresh token in Redis
- Blocklists the given access token until expiry
- Clears cookie `refreshToken`

9) `PATCH /auth/profile`
- Validated by `updateProfileSchema`
- Updates allowed fields via Prisma

10) `PATCH /auth/password`
- Validated by `changePasswordSchema`
- Verifies `currentPassword`
- Hashes and saves new password

11) `DELETE /auth/account`
- Soft-deletes user (sets `deletedAt`)
- Clears cookie `refreshToken`
- Sends deletion confirmation email (fire-and-forget)

---

## Email Service (Nodemailer)

Implemented in `src/services/emailService.js` using Nodemailer.

### Transport
- Created with `nodemailer.createTransport({ host, port, secure, auth })`
- Credentials come from `env.EMAIL_*`

### Email templates & link behavior

1) **Email verification**
- Method: `sendVerificationEmail({ to, fullName, token })`
- Link:
  - `${env.APP_CLIENT_URL}/verify-email?token=${token}`
- Token expires in **24 hours** (see `tokenUtils.generateEmailVerificationToken`)

2) **Password reset**
- Method: `sendPasswordResetEmail({ to, fullName, token })`
- Link:
  - `${env.APP_CLIENT_URL}/reset-password?token=${token}`
- Token expires in **1 hour**

3) **Account deletion confirmation**
- Method: `sendAccountDeletedEmail({ to, fullName })`

4) Invitation support
- Method: `sendInvitation({ guest, event, invitationLink })`
- Includes event title/date/location and `event.eventCode`
- Once a guest checks in, their `checkedIn` flag is locked atomically
- Duplicate token scans are rejected with `400 Bad Request`
- Security violations are logged for audit trail

#### 3. JWT Authentication

- All protected endpoints require valid JWT in headers
- Token expiry enforced server-side
- Secure secret rotation recommended

#### 4. QR Token Isolation

- Each guest gets a unique, non-reusable `qrToken`
- Tokens are UUID-based and database-indexed
- Cannot be predicted or forged

---

## API Testing (quick reference)

Use `Authorization: Bearer <ACCESS_TOKEN>` for protected endpoints. Replace `:eventId`, `:guestId`, and `:token` as applicable.

- Create event
  - POST /api/v1/events
  - Body (JSON):
    {
    "title":"My Event",
    "description":"Optional",
    "eventCategory":"Meetup",
    "venueName":"Venue",
    "address":"123 Main St",
    "startDate":"2026-06-15T14:00:00.000Z",
    "endDate":"2026-06-15T18:00:00.000Z",
    "maxGuests":150
    }

- Publish / Start / End (lifecycle)
  - POST /api/v1/events/:eventId/publish
  - POST /api/v1/events/:eventId/start
  - POST /api/v1/events/:eventId/end
  - No body required. Must be performed in order: publish → start → end.

- Invite a guest
  - POST /api/v1/events/:eventId/guests
  - Body (JSON): { "name":"Guest Name", "email":"guest@example.com", "phone":"09123456789" }
  - Response includes `invitation.token` and `invitation.invitationLink`; mail send status is in `data.mail`.

- Bulk invite
  - POST /api/v1/events/:eventId/guests/bulk-invite
  - Body (JSON): { "guests": [{ "name":"A","email":"a@x","phone":"" }, ...] }

- List events (host)
  - GET /api/v1/events

- Get event
  - GET /api/v1/events/:eventId

- Verify gate (scanner)
  - POST /api/v1/verify-gate/:token
  - Body (JSON): { "totp": "123456" }
  - First successful call checks the guest in. Subsequent calls return 400 and flag duplicate scans.

Notes

- Invitation emails include an attached `ticket.pdf` (ticket contains QR). For anti-screenshot protection the guest app should compute a rotating TOTP every 30s from the invitation token and present that dynamic QR at the gate. The scanner extracts the TOTP and calls the verify endpoint.
- If email delivery is failing, check `EMAIL_*` env vars and `data.mail` in the invite response for `messageId` or `error` details.
---

## Validation & Error Handling

### Validation
- Zod schemas live in `src/modules/auth/authValidation.js`.
- Runtime validation is enforced by `src/middlewares/validateMiddleware.js`.

### Error formatting
- `src/utils/AppError.js` is used by auth services.
- `src/middlewares/errorMiddleware.js` converts various error types into consistent JSON responses.

---

## Database (Prisma)

- Prisma client is configured in `src/config/prisma.js`.
- Schema lives in `prisma/schema.prisma`.

Common dev/ops commands:

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migration during development
npx prisma migrate dev

# Apply migrations in production-like mode
npx prisma migrate deploy

# Inspect schema visually
npx prisma studio
```

---

## Dockerization

Defined in `docker/docker-compose.yml`.

Services:
- `api`
  - built from `docker/Dockerfile.api`
  - runs `npx prisma generate` + `npx prisma migrate deploy` + `npm run dev`
  - exposes host port: **5003**
  - mounts source into container for dev (`volumes: ../:/app`)

- `postgres`
  - `postgres:16-alpine`
  - healthcheck with `pg_isready`

- `redis`
  - `redis:7-alpine`
  - appendonly enabled
  - healthcheck with `redis-cli ping`

- `nginx`
  - built from `nginx/Dockerfile`
  - exposes port **80**

- `prisma-studio`
  - runs `npx prisma studio --browser none --port 5555`
  - exposed to host port **5555**

## Troubleshooting

### Docker

- **Prisma migrations fail at startup**
  - Confirm `DATABASE_URL` is correct
  - Confirm Prisma schema matches expected DB

- **Cannot connect to PostgreSQL**
  - Check `docker-compose logs -f postgres` (or `docker-compose logs -f api`)

- **Redis store errors / rate limiter not working**
  - Confirm `REDIS_URL` and Redis container health

### Auth & Email

- **Invalid token / blocklisted token**
  - Ensure you send the correct `Authorization` header: `Bearer <accessToken>`
  - If you refresh, old access token may be blocklisted by design.

- **Emails not sending**
  - Ensure SMTP creds in `.env` are correct (`EMAIL_*`)
  - Ensure outbound email is allowed by your environment

---

## Notes

- This project relies on **cookie-based refresh tokens** (`refreshToken` cookie) for refresh flows.
- Tokens are **hardened** using Redis:
  - refresh tokens stored per user
  - access tokens blocklisted on rotation/logout

---

## Support

If you hit issues:
1. Check logs: `docker-compose logs -f api` and `docker-compose logs -f postgres`
2. Verify environment variables match `src/config/env.js`
3. Confirm Redis and Postgres containers are healthy

### Best Practices for Team

**DO:**

- Send authorization tokens in `Authorization: Bearer <token>` header
- Validate token expiry before API calls
- Log all gate verification attempts
- Hash passwords before storage

  **DON'T:**

- Expose JWT secrets in client code
- Hardcode credentials in repositories
- Store sensitive data in local storage
- Reuse QR tokens across events

1. **NEVER push directly to `main`**
   - `main` is a protected branch for production-ready code only
   - All changes must go through a Pull Request

2. **Always create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   git checkout -b fix/bug-name
   git checkout -b docs/documentation-update
   ```

3. **Never merge a PR without review**
   - All PRs must have at least **1 approval** from a team member
   - Address all review comments before merging
   - Resolve conflicts with the reviewer before merging

4. **Prevent merge conflicts**
   - Keep commits small and focused
   - Pull latest changes before starting work: `git pull origin main`
   - Rebase before submitting PR if main has new commits

### Recommended Workflow

```bash
# 1. Pull latest from main
git checkout main
git pull origin main

# 2. Create a feature branch
git checkout -b feature/your-feature

# 3. Make changes and commit
git add .
git commit -m "feat: add new feature"

---

## Sprint 1-2 — Completed Work (summary)

The backend has implemented the core features required through the first two sprints. Key completed items:

- Event CRUD + lifecycle: create, update (draft), publish, start, end, delete.
- New event fields added to match the UI: `eventCategory`, `venueName`, `address`, `coverUrl`, `themeAccent`, `rsvpDeadline`.
- Tightened validation and cross-field checks (rsvpDeadline < startDate, endDate > startDate, `eventCategory` enum, `themeAccent` formats).
- Invitations persisted in DB (`Invitation` model) and audited with `sentAt` and `sentBy`.
- Guest invite flow: create/merge guests, create invitations, generate QR tokens, enqueue email sends.
- QR & ticket generation: generate QR PNG, embed QR into `ticket.pdf` (via `pdfkit`) and attach to emails.
- Email pipeline: Resend integration plus BullMQ queue producer and a background worker; worker calls Resend and falls back to Nodemailer/Ethereal in dev.
- TOTP verification and atomic check-in: VerifyController implements TOTP verification with atomic DB update to prevent duplicate check-ins.
- Capacity enforcement: `GuestService.updateRsvp` enforces `maxGuests` and rejects CONFIRMED when capacity reached; `EventService.checkCapacity` provides capacity info.
- Seeder script for host auth hardened and gated by `ALLOW_DEV_SEED`.
- Various bug fixes: QR/PDF generation awaiting, invitation audit updates, resilience around BullMQ import shapes, and safer queue worker behavior.

These changes are implemented across the repository in the `src/` folder (services, controllers, utils, and routes).

---

## API Endpoints (consolidated)
Use `Authorization: Bearer <ACCESS_TOKEN>` for protected endpoints. Replace `:eventId`, `:guestId`, and `:token` as applicable.

- Event management
  - POST `/api/v1/events` — create event
  - GET `/api/v1/events` — list host events (paginated)
  - GET `/api/v1/events/:eventId` — get event details + RSVP stats
  - PUT `/api/v1/events/:eventId` — update draft event
  - POST `/api/v1/events/:eventId/publish` — publish event (DRAFT → ACTIVE)
  - POST `/api/v1/events/:eventId/start` — mark event as ONGOING
  - POST `/api/v1/events/:eventId/end` — mark event as COMPLETED
  - DELETE `/api/v1/events/:eventId` — delete draft/completed event
  - GET `/api/v1/events/:eventId/capacity` — capacity info (`maxGuests`, `availableSpots`)
  - GET `/api/v1/events/:eventId/dashboard` — event dashboard (stats, capacity, check-ins, media)

- Guest & Invitation flows
  - POST `/api/v1/events/:eventId/guests` — invite a guest (creates guest + invitation, enqueues email)
  - POST `/api/v1/events/:eventId/guests/bulk-invite` — bulk invite (enqueue emails)
  - GET `/api/v1/events/:eventId/guests` — list guests (filter by RSVP status)
  - PUT / POST `/api/v1/events/:eventId/guests/:guestId/rsvp` — update RSVP (PENDING/CONFIRMED/DECLINED)

- Verification & check-in
  - POST `/api/v1/verify-gate/:token` — gate scanner: submits TOTP and token; performs atomic check-in and returns result

- Email & background processing (internal)
  - Background worker listens to the `email` queue (BullMQ) and processes `invitation` jobs by calling Resend or Nodemailer fallback.
  - `src/utils/emailQueue.js` and `src/utils/emailWorker.js` manage queueing and processing.

---


### Pull Request Checklist

Before submitting a PR:

- Branch created from latest `main`
- Code follows project style guidelines
- Tests added/updated for changes
- Documentation updated
- Commit messages are clear and descriptive
- No merge conflicts with `main`
- No sensitive data committed (check `.gitignore`)

---

## Additional Notes for Team Members

- **Code Style:** Follow ESLint configuration in project
- **Testing:** Add tests for new endpoints before PR submission
- **API Documentation:** Update API docs when adding/modifying endpoints
- **Database Migrations:** Test migrations locally before pushing
- **Environment Variables:** Never commit `.env` files (they're in `.gitignore`)

Happy coding!
