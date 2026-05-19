# AGENTIC.md

## Tools Used

- GitHub Copilot (GPT-5.4) for planning, scaffolding, refactoring, and architectural iteration.
- VS Code terminal for dependency installation, schema sync, Docker validation, and runtime checks.
- Integrated browser tools for validating the actual frontend flow after implementation.

## Approach

The project was built incrementally in small, reviewable milestones.

Working pattern used:

1. Analyze the assessment and inspect `luvao` before writing code.
2. Reuse the structure of `luvao` where it improved clarity, but deliberately avoid its microservice complexity.
3. Build one vertical slice at a time.
4. Validate each slice immediately with build, lint, runtime requests, browser checks, or Docker checks.
5. Record what needed manual correction instead of accepting generated output blindly.

## Key Prompts

### Prompt 1

Request:

"Analyze the Ballast Lane assessment and the `luvao` project first, then propose an incremental roadmap instead of generating the whole project at once."

What it produced:

- a staged implementation plan
- a smaller monolithic architecture based on the structure of `luvao`

What I kept:

- the incremental roadmap
- the decision to use `Front/` and `Back/`
- the recommendation to keep one primary entity

What I changed:

- I constrained the scope further to a single backend service and avoided extra abstractions where they were not buying clarity

Why:

- the interview emphasizes explainability and live modifications more than architectural sophistication

### Prompt 2

Request:

"Implement the backend in small validated slices: health endpoint first, then Prisma and users, then auth, then journal entries."

What it produced:

- a clean NestJS bootstrap
- Prisma persistence wiring
- auth and journal controllers/services

What I kept:

- the layering pattern
- the Prisma integration approach
- the route structure for auth and journal entries

What I changed:

- I adjusted dependency versions to stay compatible with Node 18
- I corrected status codes based on runtime validation
- I refined environment handling so local development and Docker use different `DATABASE_URL` values safely

Why:

- generated code compiled quickly, but runtime validation exposed configuration and API behavior issues that needed manual correction

### Prompt 3

Request:

"Create a small frontend that mirrors the backend capabilities with login, create/edit/delete entry, filter by type, and a style inspired by survival journaling."

What it produced:

- a React + Vite frontend with auth, filtering, and CRUD views

What I kept:

- the feature-based structure
- the central `services/api.ts` pattern
- the small route map

What I changed:

- I fixed a React lint issue caused by synchronous state updates inside `useEffect`
- I validated the actual browser flow and kept only the UI pieces necessary for the assessment

Why:

- the main goal was a UI that is easy to demo and easy to modify during review

## Critical Evaluation

One useful example was the authentication slice.

What the AI did well:

- proposed a clean split between controller, service, repository, and guard
- kept the auth flow small enough to explain
- reused the persistence layer already added with Prisma

What the AI did poorly:

- initially selected NestJS versions that expected Node 20+
- left `POST /auth/login` returning `201 Created` by default
- did not account for the difference between local and container database URLs in the first environment draft

What I corrected:

- downgraded NestJS to a Node 18 compatible line
- added `@HttpCode(HttpStatus.OK)` to the login endpoint
- changed `.env.example` and Docker Compose defaults so local commands use `localhost` while containers can still use the Docker service hostname

How I verified it:

- `npm run build`
- `npm run lint`
- Prisma client generation and schema push
- live `register -> login -> /auth/me` requests
- browser validation through the frontend

Did it introduce risks?

- yes, mostly configuration and API-behavior risks rather than structural ones
- those risks were caught by running the code, not by reading it only

## What I Learned

- how to keep local and Docker database URLs separate without making the setup confusing
- how much small status-code details matter when validating generated controllers
- how Prisma plus a repository adapter is still easy to explain in a junior-level interview if the domain stays small
- how to validate a frontend slice quickly by combining build checks with an actual browser flow
- how to keep AI-assisted work defendable by validating each generated slice immediately instead of batching large changes
