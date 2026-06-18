# Changes Summary — Backend

This file summarizes what changed/what is currently in place in the backend based on the repository code snapshot.

---

## Implemented / active

### Express API (ESM)

- `src/app.js` sets up an Express app and JSON body parsing.
- Implemented endpoint:
  - `GET /api/v1/health` → returns `{ status: "OK", message: "MyGuestly AI Backend is live with ESM!" }`.

### Server bootstrap + graceful shutdown

- `src/server.js` starts the HTTP server on `process.env.PORT || 5003`.
- Handles `SIGINT` and `SIGTERM` to close the server cleanly.

### Prisma integration

- `prisma/schema.prisma` contains the current schema (User, Event, Guest, Invitation, QRCode, CheckIn, Media, MediaTag, Memory, Comment, Like, Notification).
- `src/prismaClient.js` imports the generated Prisma client from `src/generated/prisma` and uses a `globalThis.prisma` singleton pattern in non-production.

### Docker Compose services

- `docker/docker-compose.yml` defines:
  - `api` (built from `docker/Dockerfile.api`, port mapping currently to `5003:5003`)
  - `postgres` (port `5432`)
  - `redis` (port `6379`)
  - `prisma-studio` (port `5555`)
  - `nginx` (port `80`)

---

## Not wired / missing / scaffolded (important)

- `src/config/cors.js` exists but `src/app.js` currently uses `app.use(cors())` without applying the custom `src/config/cors.js` options.
- Many module files under `src/modules/*` and some config/worker files appear to be scaffolded/empty in the current snapshot.
- Queue workers referenced by Docker (`docker/Dockerfile.worker` and worker commands) appear commented out in `docker-compose.yml`.

---

## How to run (based on current compose)

From `Backend/`:

```bash
docker-compose up --build
```

- API: `http://localhost:5003/api/v1/health`
- Nginx: `http://localhost/` (reverse proxy)
- Prisma Studio: `http://localhost:5555`
