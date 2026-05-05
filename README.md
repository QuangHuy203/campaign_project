# Campaign Monorepo

This monorepo contains:

- `BackEnd`: Node.js + Express + PostgreSQL
- `FrontEnd`: React + TypeScript + Vite + Redux Toolkit/RTK Query

## Requirements

- Node.js `18.20.4`
- npm `>=8`
- Docker + Docker Compose (for containerized setup)

## Project Structure

- `BackEnd/`: API server, migrations, Docker setup
- `FrontEnd/`: Web app (axios + RTK Query + Tailwind)
- `docker-compose.yml`: runs the full stack (`db`, `backend`, `frontend`)

## Run Locally (without Docker)

### 1) Backend

```bash
cd BackEnd
cp .env.example .env
npm install
npm run migrate
npm run seed:perf
npm run dev
```

Default API URL: `http://localhost:3000`

### 2) Frontend

```bash
cd FrontEnd
cp .env.example .env
npm install
npm run dev
```

Default frontend URL: `http://localhost:5173`

## Run with Docker

From the root directory:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Postgres: `localhost:5432`

## Useful Commands

### Root workspace scripts

```bash
npm run dev:backend
npm run dev:frontend
npm run build:backend
npm run build:frontend
```

### Frontend build check

```bash
cd FrontEnd
npm run build
```

## Notes

- Node version is pinned to `18.20.4` in:
  - `.nvmrc` (root)
  - `BackEnd/.nvmrc`
  - `FrontEnd/.nvmrc`
- Backend/frontend Docker images use `node:18.20.4-alpine`.

## How I Used Claude Code
### 1) Tasks I delegated to Claude Code

I delegated most implementation and refactor work across both `FrontEnd` and `BackEnd`, including:

- Building workflow end-to-end (API route, frontend hook, shared logout button, cache reset)
- Enforcing UX rules from my `feature-delivery-gate` rule (clear success/error messages after mutations)
- Implementing campaign scheduling improvements (manual datetime input, reschedule support, timezone-safe conversion to UTC, backend conflict checks)
- Adding backend business validation (reject campaign creation if recipient emails do not exist in system)
- Creating seed data tooling for performance testing (~1000+ records)
- Writing and reorganizing unit tests for `src/services` and `src/repos`

### 2) Real prompts I used (examples)

Here are real prompts I gave Claude Code during development:

- Create logout feature.
- Validate that all recipient emails exist in the system before creating a campaign.
- Add feature to view all campaigns vs only my campaigns.

### 3) Where Claude Code was wrong or needed correction

Claude Code was useful, but I still had to review and correct behavior in several places:

- False error on successful create (`201`): backend returned success, but UI showed "System error" due strict frontend response parsing mismatch. This needed schema hardening and validation of API shape handling.
- Scheduling UX initially too simplistic: default auto `+15 min` was not practical. I corrected this to allow explicit datetime selection and proper rescheduling behavior.
- After moving test files, imports/mocks broke due relative path changes. This required follow-up fixes and full re-run of tests.
- Rule alignment required iteration: I had to tighten rules for when to show inline messages vs toast/global notifications to match real feature behavior.

### 4) What I would not let Claude Code do — and why

I would not let Claude Code act autonomously on high-risk decisions without review:
- Security-critical decisions (auth model, permission boundaries, secret handling) require manual verification.
- Unreviewed architectural changes affecting business rules (campaign visibility scope, send/schedule constraints).
- Git actions.
