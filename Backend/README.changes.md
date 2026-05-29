# README — Changes Summary (Backend)

This file documents the backend changes based on the current repository state.

> Note: The codebase looks partially scaffolded (some module/worker files exist but are empty). This README focuses on what is actually implemented and the configuration that exists today.


---

## What’s in place (implemented)

### 1) Server bootstrap (ESM)
- Uses Node.js ES Modules.
- Entry points:
  - `src/app.js`: creates the Express app, configures middleware, and exposes a health endpoint.
  - `src/server.js`: starts the HTTP server, reads `PORT`, and implements graceful shutdown.

**Health endpoint**
- `GET /api/v1/health`
  - Returns `{ status: "OK", message: "MyGuestly AI Backend is live with ESM!" }`.

### 2) Environment loading + config hooks
- `import "dotenv/config";` is used in both `src/app.js` and `src/server.js`, so environment variables are loaded automatically.

### 3) CORS configuration
- `src/config/cors.js`
  - Reads allowed origins from `env.ALLOWED_ORIGINS` (comma-separated).
  - Allows requests with no origin (useful for curl/Postman).
  - Enables `credentials: true`.
  - Allowed headers: `Content-Type`, `Authorization`, `X-Requested-With`.
  - Exposed headers: `X-Total-Count`, `X-Page`.

> Observation: `src/app.js` currently uses `app.use(cors())` directly instead of the custom `src/config/cors.js` options.

### 4) Prisma client generation output + Prisma runtime config
- `prisma/schema.prisma` defines the data model.
- `src/prismaClient.js`
  - Imports the generated Prisma client from `src/generated/prisma`.
  - Enables verbose Prisma logs in development.
  - Uses a `globalThis.prisma` singleton pattern outside production to avoid repeated PrismaClient instantiation.

### 5) Database schema (Prisma)
`prisma/schema.prisma` includes these main models:

- **User**
  - `id`, `fullName`, `email` (unique), optional `phone` (unique), `password`, `role`.
  - Verification state: `isVerified`.
  - Soft delete: `deletedAt`.
- **Event**
  - `eventCode` (unique), `title`, `date/endDate`, `venue`, capacity, publication status.
  - Relations to host user and guests/check-ins/media/memories/notifications.
- **Guest**
  - Belongs to an event.
  - Optional email/phone.
- **Invitation**
  - Tracks RSVP status.
  - Has a unique `token` (UUID by default) and a `guestId` unique relation.
  - Optional link to a registered `userId`.
- **QRCode**
  - One-to-one with `Invitation` via `invitationId` (unique).
  - Stores a unique `code` and scan metadata.
- **CheckIn**
  - One check-in per guest (`guestId` unique).
  - Stores `checkedAt` and optional IP.
- **Media**
  - Media uploaded for an event.
  - Stores metadata (dimensions, duration, voice note url, JSON metadata).
- **MediaTag**
  - AI-generated labels attached to media.
- **Memory**
  - Text/voice notes left by a guest.
- **Comment**
  - Comments attached to media.
- **Like**
  - Like records per user per media.
- **Notification**
  - Notification types + metadata stored as JSON.

### 6) Docker & multi-service orchestration
- `docker/docker-compose.yml` (Backend)
  - **api** service built from `docker/Dockerfile.api`
    - Publishes port mapping `5003:5003`.
    - Uses `env_file: - ../.env`.
    - Mounts repo into `/app` and preserves `node_modules` via an anonymous volume.
  - **postgres** service using `postgres:16-alpine`
    - Healthcheck uses `pg_isready`.
  - **redis** service using `redis:7-alpine`
    - Healthcheck uses `redis-cli ping`.
  - **prisma-studio** service
    - Runs `npx prisma studio` on port `5555`.
  - **nginx** service
    - Built from `nginx/Dockerfile` and exposed on port `80`.

> Observation: media/invitation/ai workers appear commented out in `docker-compose.yml`.

---

## Project structure (current)

Key folders present:
- `prisma/` (schema + migrations)
- `src/`
  - `app.js`
  - `server.js`
  - `config/` (`env.js`, `redis.js`, `cors.js`)
  - `prismaClient.js`
  - `modules/` (auth, events, invitations, media, memories, notifications, qr)
  - `queues/` (jobs/workers folder exists, but no worker files were found in current tree)

---

## Implemented API surface

From current code:
- `GET /api/v1/health`

> Observation: module routes/controllers appear to exist as files but some are empty. That means other endpoints may be planned but not currently implemented in code.

---

## How to run

### Docker Compose
From `Backend/`:

```bash
docker-compose up --build
```

- API: `http://localhost:5003/api/v1/health`
- Nginx: `http://localhost/` (configured as reverse proxy)
- Prisma Studio: `http://localhost:5555`

### Local without Docker
Install dependencies then run:

```bash
npm install
npm run dev
```

---

## Notes / follow-ups

1. `src/config/cors.js` is not currently wired into `src/app.js`.
2. Several module files under `src/modules/*` and worker files appear empty or missing, so documentation for those endpoints should be added once their implementations are present.
3. Workers in `docker-compose.yml` are commented out; enable them once queue processors exist.

