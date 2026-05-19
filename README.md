# mind-shelter

Mind Shelter is a small full-stack journaling application for reflective daily notes and one long-term philosophy note per user.

## Current Status

The repository is being built incrementally for the Ballast Lane technical assessment.

Current milestone:

- backend API bootstrap
- environment configuration
- Docker Compose foundation
- public health endpoint

## Planned Architecture

- `Back/api`: NestJS API
- `Front/`: React web application
- `postgres`: PostgreSQL persistence

The implementation intentionally stays small and explainable. It reuses the structural spirit of `luvao` without copying its microservice complexity.

## Local Setup

1. Copy `.env.example` to `.env`.
2. Install backend dependencies in `Back/api`.
3. Run the API locally or with Docker Compose.

## Backend Commands

From `Back/api`:

- `npm install`
- `npm run start:dev`
- `npm run build`
- `npm run lint`

## Docker Compose

From the repository root:

- `docker compose up --build`

This will start:

- `postgres`
- `mind-shelter-api`

## Health Check

- `GET /health`

Example local URL:

- `http://localhost:3001/health`

## Testing

Testing will be added incrementally. The final repository will document how to run all tests and CI checks.

## Documentation

- Informal user story: `docs/user-story.md`
- Agentic workflow notes: `AGENTIC.md`
