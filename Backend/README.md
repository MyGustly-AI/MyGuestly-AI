# MyGuestly AI — Backend Service

Welcome to the **MyGuestly AI** backend service. This REST API handles event management, secure guest authentication, QR code verification, and real-time gate access control with built-in anti-fraud mechanisms.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Running the Server](#running-the-server)
- [Database Management](#database-management)
- [Security Architecture](#security-architecture)
- [API Overview](#api-overview)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 18+](https://nodejs.org/) (optional, for local development)

### Get Started in 3 Steps

```bash
# 1. Clone and navigate to backend
git clone https://github.com/Johnsonchuks/MyGuestly-AI.git
cd MyGuestly-AI/Backend

# 2. Set up environment variables
cp .env.example .env

# 3. Start the server with Docker
docker-compose up --build
```

Your API will be running on **http://localhost:5000**

---

## Tech Stack

| Component            | Technology              | Purpose                            |
| -------------------- | ----------------------- | ---------------------------------- |
| **Runtime**          | Node.js + ESM           | JavaScript runtime with ES modules |
| **Framework**        | Express.js              | Lightweight REST API framework     |
| **Database ORM**     | Prisma                  | Type-safe database access          |
| **Database**         | PostgreSQL              | Primary relational database        |
| **Containerization** | Docker & Docker-Compose | Isolated development environment   |
| **Dev Tool**         | Nodemon                 | Auto-restart on file changes       |
| **Security**         | JWT, TOTP               | Authentication & fraud prevention  |

---

## Project Structure

```
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

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Johnsonchuks/MyGuestly-AI.git
cd MyGuestly-AI/Backend
```

### 2. Configure Environment Variables

Create a `.env` file from the template:

```bash
cp .env.example .env
```

Edit `.env` and configure:

- `JWT_SECRET` — Secret key for token generation
- `JWT_EXPIRES_IN` — Token expiration period (e.g., "3d")
- `CLOUDINARY_*` — Media upload credentials
- `EMAIL_*` — SMTP configuration for notifications

**Note:** Database URL is automatically configured in Docker Compose.

### Security — Do NOT commit secrets

- Never commit `.env` or other files containing secrets into source control.
- If you accidentally committed a secrets file, remove it from git with:

```bash
git rm --cached Backend/.env
git commit -m "remove committed env"
```

Then rotate any exposed credentials (JWT secrets, DB passwords, API keys).

### 3. Install Dependencies (Optional - for local development)

```bash
npm install
```

---

## Running the Server

### Using Docker Compose (Recommended)

```bash
# Start both Node.js server and PostgreSQL database
docker-compose up --build

# Start without rebuilding
docker-compose up

# Run in background (detached mode)
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f
```

**Server Details:**

- **API URL:** http://localhost:5000
- **Database Port:** 5432
- **Auto-reload:** Enabled via Nodemon (changes in `src/` trigger restart)

### Running Locally (Without Docker)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

---

## Database Management

### Apply Schema Changes

```bash
# Apply pending migrations
npx prisma migrate dev

# Create new migration after schema changes
npx prisma migrate dev --name <migration_name>

# Push schema without creating migration
npx prisma db push
```

### Inspect Database

```bash
# Open Prisma Studio (visual database explorer)
npx prisma studio
```

This launches an interactive GUI at http://localhost:5555 where you can:

- View all database records
- Create, update, delete data
- Monitor relationships

### Database Models

- **User** — Event hosts, photographers, admins
- **Event** — Event details, venue, date, unique code
- **Guest** — RSVP status, QR token, check-in status
- **Media** — Photos/videos with upload metadata

---

## Security Architecture

### Anti-Fraud Mechanisms

Our system implements multiple layers of security for gate verification:

#### 1. Time-Based One-Time Passwords (TOTP)

- QR code data regenerates every **30 seconds**
- ±1 step clock tolerance for network lag & phone drift
- Prevents screenshot/replay attacks

#### 2. Atomic Single-Use Verification

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

---

<!-- ## API Overview

### Authentication Endpoints

```
POST   /auth/register          # Create new user account
POST   /auth/login             # User login
POST   /auth/refresh-token     # Refresh expired JWT
```

### Event Management

```
POST   /events                 # Create new event
GET    /events                 # List user's events
GET    /events/:id             # Get event details
PUT    /events/:id             # Update event
DELETE /events/:id             # Delete event
```

### Guest Management

```
POST   /events/:id/guests      # Invite guest to event
GET    /events/:id/guests      # List event guests
PUT    /guests/:id             # Update guest RSVP
DELETE /guests/:id             # Remove guest
```

### Gate Verification

```
POST   /verify-gate/:token     # Verify QR code & check in guest
GET    /events/:id/check-ins   # View check-in summary
```

### Media Upload

```
POST   /events/:id/media       # Upload photo/video
GET    /events/:id/media       # List event media
DELETE /media/:id              # Delete media
``` -->

---

## Troubleshooting

### Docker Issues

| Problem                        | Solution                                                     |
| ------------------------------ | ------------------------------------------------------------ |
| `docker: command not found`    | Restart Docker Desktop or terminal                           |
| `Port 5000 already in use`     | `docker-compose down` or change port in `docker-compose.yml` |
| `Cannot connect to PostgreSQL` | Ensure `docker-compose up` ran successfully, check logs      |

### Database Issues

| Problem                   | Solution                                    |
| ------------------------- | ------------------------------------------- |
| `Prisma client not found` | Run `npm install` and rebuild containers    |
| `Migration failed`        | Check schema syntax, review Prisma docs     |
| `Database locked`         | Restart Docker: `docker-compose restart db` |

### Development Issues

| Problem                | Solution                                               |
| ---------------------- | ------------------------------------------------------ |
| Changes not reflecting | Ensure nodemon is running; check `docker-compose logs` |
| Port conflicts         | Modify `docker-compose.yml` port mappings              |
| Module not found       | Clear node_modules and reinstall: `npm install`        |

### Check Status

```bash
# View running containers
docker-compose ps

# View application logs
docker-compose logs -f backend

# View database logs
docker-compose logs -f db

# Rebuild everything
docker-compose up --build --force-recreate
```

---

## Support & Questions

For issues, questions, or feature requests:

1. Check this README and existing GitHub issues
2. Create a new GitHub issue with detailed description
3. Contact the backend team lead

---

## Branch & Workflow Guidelines

### Critical Rules

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
