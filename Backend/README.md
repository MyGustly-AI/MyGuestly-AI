# MyGuestly AI — Backend Service

An **AI-powered event hosting and guest experience platform** backend built with Node.js + Express.

This service provides:
- Secure user authentication (access + refresh JWTs)
- Email verification, forgot/reset password flows
- Centralized security middleware (rate limiting, headers, validation)
- Redis-backed session hardening (refresh token storage + access token blocklist)
- Dockerized deployment (API + Postgres + Redis + NGINX + Prisma Studio)

---

## Table of Contents

- [Quick Start](#quick-start)
- [Project Overview](#project-overview)
- [Architecture & Project Structure](#architecture--project-structure)
- [Security & Request Lifecycle](#security--request-lifecycle)
- [Configuration (Environment Variables)](#configuration-environment-variables)
- [Auth Module (End-to-End)](#auth-module-end-to-end)
  - [Token strategy](#token-strategy)
  - [Routes & behaviors](#routes--behaviors)
- [Email Service (Nodemailer)](#email-service-nodemailer)
- [Validation & Error Handling](#validation--error-handling)
- [Database (Prisma)](#database-prisma)
- [Dockerization](#dockerization)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- Docker Desktop

### Run with Docker Compose

```bash
cd MyGuestly-AI/Backend
cp .env.example .env

docker-compose up --build
```

Then open:
- API: **http://localhost:5003/api/v1/health** (health check)
- Prisma Studio: **http://localhost:5555**
- NGINX: **http://localhost:80**

> Note: docker-compose port mapping in this repo exposes the API on `5003`.

---

## Project Overview

The backend is organized as a set of Express middlewares + route modules.

At a high level:
1. Requests enter the Express pipeline (`src/app.js`).
2. Security middleware runs (helmet, CORS, request logging, rate limiting).
3. Auth middleware protects private endpoints.
4. Validation middleware ensures request body correctness.
5. Route handlers call service functions.
6. Errors are formatted consistently by the centralized error middleware.

---

## Architecture & Project Structure

```bash
Backend/
├── prisma/
│   ├── schema.prisma          # Database models (User, Event, Guest, Media)
│   └── migrations/            # Database version control
├── src/
│   ├── app.js                 # Express app configuration
│   ├── controllers/           # Business logic & request handlers
│   ├── middlewares/           # Authentication & validation guards
│   ├── routes/                # HTTP endpoint definitions
│   ├── services/              # Utility functions & helpers
│   ├── utils/                 # Shared utilities (Prisma client, validators)
│   └── generated/prisma/      # Auto-generated Prisma types
├── .env.example               # Environment variables template (do NOT commit secrets)
├── Dockerfile                 # Container image instructions
├── docker-compose.yml         # Multi-container orchestration
├── nodemon.json               # Development auto-reload config
├── package.json               # Dependencies & scripts
└── README.md                  # Documentation
```

Key folders:

- `src/middlewares/` — authentication, authorization, validation, logging, rate limiting, error/404 handling
- `src/modules/` — feature modules (currently includes the full auth module and additional module stubs)
- `src/services/` — service layer (e.g. `emailService`, business services)
- `src/utils/` — shared utilities (token generation, password hashing, ApiResponse, AppError, etc.)
- `src/config/` — configuration (env validation, redis, prisma)
- `src/routes/` — Express route wiring (e.g. `index.js` mounts feature routes)

Core boot files:
- `src/app.js` — middleware pipeline + health endpoint + route mounting
- `src/server.js` — starts the HTTP server and implements graceful shutdown

---

## Security & Request Lifecycle

### 1) Security Headers (Helmet)
- Implemented in `src/app.js` via `helmet()`.

### 2) CORS
- Implemented in `src/app.js` via `corsMiddleware` (`src/config/cors.js`).

### 3) Request Logging
- Implemented in `src/app.js` via `requestLoggerMiddleware.js`.

### 4) Rate Limiting (Redis-backed)
- Implemented in `src/middlewares/rateLimitMiddleware.js`.
- General API limiter:
  - `windowMs: 15m`
  - `max: 100`
  - uses `RedisStore` so limits are shared across containers.
- Login-specific limiter:
  - `windowMs: 15m`
  - `max: 5`
  - mitigates brute-force attempts on `/auth/login`.

### 5) JWT Authentication + Redis Hardening
- `src/middlewares/authenticateMiddleware.js`
  - Expects header: `Authorization: Bearer <token>`
  - Verifies JWT signature using `env.JWT_SECRET`
  - Sets `req.user` with decoded JWT payload
  - Checks Redis blocklist:
    - key: `blocklist:${token}`

### 6) Optional Auth
- `src/middlewares/optionalAuthMiddleware.js`
  - If token is present, it sets `req.user`; otherwise continues without failing.

### 7) Validation
- `src/middlewares/validateMiddleware.js`
  - Uses `schema.safeParse(req.body)`
  - On failure returns `400` with `errors`.

### 8) Centralized Error Handling
- `src/middlewares/errorMiddleware.js` formats errors consistently.
  - Handles:
    - custom `AppError` (statusCode/message/errors)
    - validation errors (400)
    - JWT errors (401 invalid/expired token)
    - Prisma errors (400 database operation failed)

---

## Configuration (Environment Variables)

Environment variables are validated on startup in `src/config/env.js` using Zod.

At minimum, the service expects:

### Core
- `PORT` (default `5003`)
- `NODE_ENV` (`development|production|test`)
- `DATABASE_URL`
- `REDIS_URL`

### JWT
- `JWT_SECRET` (access token signing)
- `JWT_REFRESH_SECRET` (refresh token signing)
- `JWT_ACCESS_EXPIRES_IN` (default `15m`)
- `JWT_REFRESH_EXPIRES_IN` (default `7d`)
- `JWT_EMAIL_VERIFICATION_SECRET`
- `JWT_PASSWORD_RESET_SECRET`

### CORS
- `ALLOWED_ORIGINS` (default `http://localhost:3000`)

### Email (SMTP)
- `EMAIL_HOST`
- `EMAIL_PORT` (default `587`)
- `EMAIL_SERVICE_USER`
- `EMAIL_SERVICE_PASS`

### App URLs
- `APP_CLIENT_URL` (frontend base; used in email links)
- `APP_API_URL`

### Cloudinary (declared in env schema)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

---

## Auth Module (End-to-End)

Auth is split into:
- **Routes**: `src/modules/auth/authRoutes.js`
- **Controller**: `src/modules/auth/authController.js`
- **Service**: `src/modules/auth/authService.js`
- **Validation**: `src/modules/auth/authValidation.js`
- **Token generation**: `src/utils/tokenUtils.js`

### Token strategy

The system issues:
- **Access token**
  - JWT signed with `env.JWT_SECRET`
  - includes payload: `userId`, `role`, `email`
  - expiry: `env.JWT_ACCESS_EXPIRES_IN` (default `15m`)

- **Refresh token**
  - JWT signed with `env.JWT_REFRESH_SECRET`
  - expiry: `env.JWT_REFRESH_EXPIRES_IN` (default `7d`)
  - additionally stored in Redis:
    - key: `refresh:${userId}`
    - TTL: 7 days

- **Blocklist for access tokens** (hardening)
  - old access tokens are added to:
    - key: `blocklist:${accessToken}`
    - TTL: remaining TTL of that access token
  - checked in `authenticateMiddleware.js`

### Routes & behaviors

Base: `/api/v1/auth` (mounted under `/api/v1` in `src/routes/index.js`)

#### Public routes

1) `POST /auth/register`
- Validated by `registerSchema` (Zod)
- Creates user (soft-delete restore supported)
- Sends email verification email
- Returns:
  - `accessToken`
  - refresh token (also set by controller as httpOnly cookie after login only; register currently returns refreshToken in response from service)

2) `POST /auth/login`
- Validated by `loginSchema`
- Rate-limited by `loginLimiter`
- Returns:
  - `accessToken`
- Sets cookie:
  - cookie name: `refreshToken`
  - `httpOnly: true`
  - `secure` only in production
  - `sameSite: strict`
  - `maxAge: 7d`

3) `POST /auth/refresh`
- Reads refresh token from cookies (`req.cookies?.refreshToken`)
- Reads old access token from `Authorization` header
- Verifies refresh token signature
- Confirms refresh token matches Redis stored token
- Rotates refresh token in Redis
- If old access token is provided, it is blocklisted until expiry
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

# 4. Push to your branch (NOT main)
git push origin feature/your-feature

# 5. Open a Pull Request on GitHub
# - Wait for reviews
# - Address feedback
# - Don't merge until approved
```

### Commit Message Format

Use conventional commits for clarity:

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation updates
- `refactor:` — Code restructuring
- `test:` — Test additions/updates
- `chore:` — Build, dependencies, tooling

Example: `git commit -m "feat: add QR code validation endpoint"`

### Pull Request Checklist

Before submitting a PR:

- ✅ Branch created from latest `main`
- ✅ Code follows project style guidelines
- ✅ Tests added/updated for changes
- ✅ Documentation updated
- ✅ Commit messages are clear and descriptive
- ✅ No merge conflicts with `main`
- ✅ No sensitive data committed (check `.gitignore`)

---

## Additional Notes for Team Members

- **Code Style:** Follow ESLint configuration in project
- **Testing:** Add tests for new endpoints before PR submission
- **API Documentation:** Update API docs when adding/modifying endpoints
- **Database Migrations:** Test migrations locally before pushing
- **Environment Variables:** Never commit `.env` files (they're in `.gitignore`)

Happy coding!
