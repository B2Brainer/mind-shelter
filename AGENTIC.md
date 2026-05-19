# AGENTIC.md

## Tools Used

- GitHub Copilot (GPT-5.4) for planning, scaffolding, debugging, and implementation support.
- VS Code terminal for dependency management, Docker validation, runtime checks, and test execution.
- Browser developer tools for validating frontend behavior and authenticated flows.

## Approach

I approached the project incrementally and validated each feature before moving to the next.

Instead of generating the full application at once, I used AI to help plan small implementation slices and then reviewed the generated output before integrating it.

My working process was:

1. Analyze the Ballast Lane assessment requirements before making implementation decisions.
2. Reuse technologies and architectural conventions already familiar to me from a previous personal project (`luvao`) to reduce setup friction and focus on software quality, infrastructure, and explainability.
3. Keep the domain intentionally small and easy to explain.
4. Build one feature slice at a time (health → persistence → auth → journal domain → UI → infrastructure).
5. Validate each slice through builds, linting, API requests, browser flows, or Docker execution before continuing.

The idea was to not let the AI get into an error cicle

---

## Key Prompts

### Prompt 1 — Assessment Analysis and Planning

Request:

> Analyze the Ballast Lane technical assessment and inspect the technologies and architectural conventions used in my existing project (`luvao`). Based on that, propose an incremental roadmap for a small and explainable project instead of generating everything at once.

What it produced:

- a staged implementation roadmap
- recommendations for incremental milestones
- suggestions for project structure and validation checkpoints

What I kept:

- the incremental implementation strategy
- the idea of building small reviewable slices
- the recommendation to keep one primary entity
- using familiar stack conventions to reduce unnecessary complexity

What I changed:

- I narrowed the scope further to keep the project easier to explain during live review
- I avoided unnecessary abstractions that would not improve clarity

Why:

The assessment emphasizes understanding, explainability, testing, and live modifications more than architectural sophistication.

---

### Prompt 2 — Project Idea Exploration

Request:

> I want to combine philosophy and videogames into a small journaling project inspired by The Long Dark, where users can create daily notes and maintain a single general note connecting ideas across days. What do you think of this idea and how can it remain simple enough for the assessment?

What it produced:

- a simplified journaling domain
- the idea of keeping a single primary entity
- suggestions for a small business rule

What I kept:

- the survival-inspired journaling concept
- one main entity (`JournalEntry`)
- a small domain with daily entries and one general reflection

What I changed:

- I deliberately constrained the scope to avoid feature creep

Why:

I wanted a project that reflected my interests but remained small enough to fully understand and explain.

---

### Prompt 3 — Incremental Backend Implementation

Request:

> Implement the backend in small validated slices, but avoid a problem I had previously in `luvao`: configuration drift between local execution and Docker. In that project I lost time because some services assumed container hostnames and container-only environment values even when I was running them directly from my machine, which made database and auth issues harder to debug. Start with a minimal running API and health endpoint, then continue incrementally with persistence, authentication, and journal functionality, keeping environment boundaries explicit and easy to reason about.

What it produced:

- a minimal NestJS API bootstrap
- Prisma persistence and configuration scaffolding
- authentication and journal feature scaffolding with clearer environment boundaries

What I kept:

- the layered organization (controller/service/repository)
- the incremental implementation flow
- validation and route organization ideas
- the emphasis on checking local and container execution early

What I changed:

- I adjusted dependency versions for compatibility with my environment
- I corrected status codes after runtime testing
- I simplified environment configuration for local and Docker execution

Why:

This prompt reflected a class of problem I had already seen before: once local and container assumptions get mixed, even small backend features become harder to trust. Framing the request this way helped keep the implementation incremental while reducing hidden setup coupling.

---

## Critical Evaluation

One useful example was the authentication slice.

### What the AI got right

- proposed a clean separation between controller, service, and persistence logic
- kept the authentication flow small enough to explain comfortably
- integrated naturally with the persistence layer

### What required improvement

- initial dependency choices were not aligned with my runtime environment
- some HTTP behavior needed refinement after testing
- environment configuration initially mixed local and container assumptions

### What I changed

- adjusted dependency compatibility
- refined endpoint behavior after validation
- improved environment configuration for reproducible local and Docker setup

### How I verified it

- `npm run build`
- `npm run lint`
- API runtime checks
- authenticated request validation
- browser-level flow verification
- Docker execution checks

### Risks introduced by AI-generated code

Most issues were runtime or configuration-related rather than architectural.

This reinforced the importance of validating generated output through execution instead of assuming generated code is correct by inspection.

---

## What I Learned

- how to structure feature delivery incrementally instead of generating large batches of code
- how environment configuration differs between local development and containerized execution
- how small API details (status codes, validation, auth flow behavior) matter in maintainability and correctness
- how to keep AI-assisted code defendable by validating every generated slice before continuing
- how familiar technologies can reduce implementation risk and let me focus on software quality and infrastructure concerns
