# Assessment Checklist Mapping

This file maps the Ballast Lane assessment expectations to the current repository.

## Core Requirements

- Working web application: satisfied
  - React frontend in `Front/`
  - NestJS API in `Back/api/`
- CRUD for at least one entity: satisfied
  - `JournalEntry` supports create, read, update, delete
- Authentication: satisfied
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/me`
- Public operation: satisfied
  - `GET /health`
- Protected operation: satisfied
  - all `journal-entries` routes require authentication
- Persistence that survives restarts: satisfied
  - PostgreSQL via Docker volume in `docker-compose.yml`

## Code Quality

- Separation of concerns: satisfied
  - `application`, `domain`, `infrastructure`, `interface/http`
- Linting/formatting: satisfied
  - backend and frontend lint scripts
  - backend and frontend format scripts
- Naming and structure: satisfied
  - feature-based frontend and layered backend
- `.gitignore`: satisfied

## Testing

- Minimum 5 meaningful tests: satisfied
  - 10 backend tests currently cover auth and journal business rules

## Documentation

- README: satisfied
- AGENTIC.md: satisfied
- User story in repository: satisfied
- Architecture notes/diagram: satisfied

## Infrastructure Focus

- Dockerfile: satisfied
  - `Back/api/Dockerfile`
  - `Front/Dockerfile`
- docker-compose: satisfied
  - `docker-compose.yml`
- GitHub Actions CI: satisfied
  - `.github/workflows/ci.yml`
- Health endpoint: satisfied
  - `GET /health`

## Backend Expectations

- Validation: satisfied
  - DTO validation on auth and journal routes
- Proper status codes: satisfied
  - `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`
- Business rule beyond CRUD: satisfied
  - one `GENERAL` entry per user
  - users can only access their own entries
- Filtering or pagination: satisfied
  - filter by type and paginated list endpoint
- Environment variables: satisfied
  - `.env.example` and `Front/.env.example`

## Final Validation Performed

- backend build: passed
- backend lint: passed
- backend tests: passed
- frontend build: passed
- frontend lint: passed
- `docker compose up -d --build`: passed
- `GET /health`: passed
- frontend on `http://localhost:8080`: passed
- smoke test for register, login, `GET /auth/me`, journal create/list, duplicate `GENERAL`: passed

## Submission Notes

Two assessment items are outside source code itself and must still be handled as submission steps:

- push the repository to a public GitHub repository
- ensure the final git commit history reflects small, intentional milestones