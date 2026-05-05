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
npm install
npm run migrate
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
