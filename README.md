# mind-shelter

Mind Shelter is a small full-stack journaling application for reflective daily notes and one long-term philosophy note per user.

## What It Does

Each authenticated user can:

- register and log in
- create daily journal entries
- keep one long-term `GENERAL` reflection note
- edit and delete their own entries
- filter entries by type and browse them in a simple web UI

Public functionality currently includes:

- `GET /health`
- frontend login/register screens

Protected functionality currently includes:

- `GET /auth/me`
- full CRUD for `JournalEntry`

## Architecture

- `Back/api`: NestJS API with Prisma and PostgreSQL
- `Front/`: React + Vite + TypeScript web client
- `docker-compose.yml`: local stack for Postgres, API, and frontend

Architecture notes and diagram: [docs/architecture.md](docs/architecture.md)

The implementation intentionally stays small and explainable. It reuses the structural spirit of `luvao` without copying its microservice complexity.

## Local Setup

1. Copy `.env.example` to `.env`.
2. Install backend dependencies in `Back/api`.
3. Install frontend dependencies in `Front`.
4. Start Postgres, the API, and the frontend.

## Environment Variables

Root `.env` example values are documented in `.env.example`.

Important variables:

- `API_PORT`
- `FRONTEND_ORIGIN`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

Frontend local example values are documented in `Front/.env.example`.

## Run Locally

### 1. Start PostgreSQL with Docker

From the repository root:

- `docker compose up -d postgres`

### 2. Start the API

From `Back/api`:

- `npm install`
- `npm run prisma:generate`
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mind_shelter?schema=public npm run prisma:push`
- `npm run start:dev`
- `npm run build`
- `npm run format`
- `npm run lint`
- `npm run test`

### 3. Start the frontend

From `Front`:

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run format`
- `npm run lint`

## Docker Compose

From the repository root:

- `docker compose up --build`

This will start:

- `postgres`
- `mind-shelter-api`
- `mind-shelter-web`

Default URLs:

- frontend: `http://localhost:8080`
- API: `http://localhost:3001`
- health endpoint: `http://localhost:3001/health`

## Health Check

- `GET /health`

## Testing

Backend tests currently cover:

- registration success
- duplicate registration rejection
- login success
- invalid login rejection
- authenticated current-user lookup
- `GENERAL` entry uniqueness rule
- pagination/list behavior
- ownership protections
- update not-found behavior
- delete behavior

Run backend tests from `Back/api`:

- `npm run test`

## CI

GitHub Actions workflow: `.github/workflows/ci.yml`

Current pipeline checks:

- backend install, Prisma client generation, lint, build, test
- frontend install, lint, build

## Documentation

- Informal user story: `docs/user-story.md`
- Agentic workflow notes: `AGENTIC.md`
- Architecture notes and diagram: `docs/architecture.md`

## API Summary

Public routes:

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`

Protected routes:

- `GET /auth/me`
- `POST /journal-entries`
- `GET /journal-entries`
- `GET /journal-entries/:id`
- `PATCH /journal-entries/:id`
- `DELETE /journal-entries/:id`

## Business Rule

Each user may own many `DAILY` entries and exactly one `GENERAL` entry.

Users can only access and mutate their own entries.
