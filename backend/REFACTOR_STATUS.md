# Backend Refactor Status

## Current status

The backend has started the contract-first refactor.

What is already in place:

- `app.ts` now mounts `createExpressRouter(...)` from `@contract-first-api/express`
- `ai.service.ts` contains the AI contract handlers
- `wordGroups.service.ts` contains the word group contract handlers
- the old `routes/` layer for AI and word groups has been removed
- the old `controllers/` layer for AI and word groups has been removed
- the old `services/wordGroupsService.js` passthrough layer has been removed
- auth is now represented as request context plus `requireAuthenticatedClerkId(...)`
- backend uses the shared workspace contracts package: `@language-learning-app/contracts`

So the backend shape is already moving toward:

- app/router wiring
- contract handlers
- database/infrastructure

instead of:

- routes
- controllers
- services
- database

## What is still incomplete

The backend is not yet in a clean fully-TypeScript state.

The main remaining issues are:

1. The backend still mixes `.js` and `.ts` files.

Important examples:

- `index.js`
- `database/db.js`
- `database/schema.ts`
- `middleware/dbReadyMiddleware.js`
- `middleware/errorHandlingMiddleware.js`
- `services/aiService.js`

2. Type-checking currently gets blocked by existing database/module issues.

Known problems seen while checking the backend:

- `database/db.ts` and `database/db.js` are both present and create confusion
- Drizzle imports are currently not type-checking cleanly in the existing backend setup
- several remaining JS files do not provide declarations, so TS sees them as `any`

3. The new contract-first files are structurally correct, but the backend cannot yet be treated as a clean TS-first codebase because the surrounding infrastructure is still mixed.

## Recommended target

The goal should be a fully TypeScript backend for the active backend codepath.

That means the backend should end up with:

- `app.ts`
- `index.ts`
- `ai.service.ts`
- `wordGroups.service.ts`
- `middleware/*.ts`
- `database/*.ts`
- `routes/clerkRouter.ts`

and no active duplicate `.js` versions for those same concerns.

## Recommended next steps

### 1. Make the backend runtime entry fully TypeScript

Convert:

- `index.js` -> `index.ts`

Then make sure the start command runs the TS entry consistently with the repo's current runtime approach.

### 2. Convert infrastructure files that the new router path depends on

Convert these next:

- `middleware/dbReadyMiddleware.js` -> `.ts`
- `middleware/errorHandlingMiddleware.js` -> `.ts`
- `services/aiService.js` -> `.ts`

These are directly used by the new contract-first path, so they should stop leaking `any` into the typed code.

### 3. Resolve the database layer properly in TypeScript

This is the main remaining blocker.

Work to do:

- decide whether `database/db.ts` or `database/db.js` is the real source of truth
- remove the duplicate path once the TS version is correct
- keep `database/schema.ts` as the single source of truth for the schema
- make Drizzle imports type-check correctly in the chosen TS setup

The backend should not keep both JS and TS versions of the DB layer long-term.

### 4. Re-run backend type-checking against the real active files

Once the infrastructure and database files are converted, run a full backend TS check again and fix remaining mismatches instead of working around them file-by-file.

### 5. After backend TypeScript is stable, continue the frontend contract-first migration

Suggested frontend order:

- replace manual API client implementation with `@contract-first-api/api-client`
- keep current component surface stable
- move to `@contract-first-api/react-query` later as a separate step

## Architectural direction

The intended backend architecture after this refactor is:

- shared contracts define the API surface
- `createExpressRouter(...)` mounts the contract tree
- service files contain contract handlers
- cross-cutting auth lives in context/helper logic
- database code stays in the database layer

The point is not to preserve old layers for their own sake.
The point is to remove glue code that the contract-first library already replaces.

## Notes from the refactor so far

- Repeating explicit contract return types in each service handler was unnecessary and has already been reduced.
- Repeating auth checks inside handlers exposed a likely library v2 improvement: contract metadata plus a `beforeServiceCall` hook.
- The contracts workspace package resolves correctly from backend and frontend after workspace install.

## Definition of done for the backend phase

The backend phase should be considered complete when:

- the active backend path is fully TypeScript
- there are no duplicate JS/TS versions of the same active modules
- the backend type-checks cleanly
- the contract router is the real production API path for word groups and AI generation
- old route/controller glue for those endpoints is gone
