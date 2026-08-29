---
name: rest-rpc
description: Use rest-rpc in TypeScript apps with contract-first API design, server adapters, typed clients, TanStack Query, OpenAPI, streaming, and monorepo architecture. Use hosted docs for current API details.
---

# rest-rpc

Use this skill for `rest-rpc` work: setup, contracts, adapters, clients, TanStack Query, OpenAPI, streaming/WebSockets, migrations, debugging, and architecture.

## Core Model

Keep the architecture contract-first:

- The API contract is the source of truth.
- Define each route once in the contract.
- Preserve explicit HTTP semantics: method, path, params, query, headers, body, responses, status codes, content types, and metadata.
- Derive server handlers, fetch clients, TanStack Query helpers, OpenAPI, and WebSocket helpers from the same contract.
- Avoid duplicated client/server types when the contract can infer them.
- Use `router` and `route` for contract declaration instead of untyped object literals.
- Keep contracts modular, then compose routers where the full API surface is needed.
- Use Standard Schema-compatible validators such as Zod, Valibot, or ArkType when runtime validation is needed.
- Use the built-in type-only schema helper when runtime validation is unnecessary.

## Library Philosophy

`rest-rpc` is a type-safe bridge between an application's existing HTTP architecture and its shared API contract. It does not replace framework architecture: keep using the framework's routing, modules, plugins, middleware, dependency injection, auth, and deployment conventions. Use `rest-rpc` explicitly where it preserves the contract-to-runtime type link. Prefer its helpers over partial or ad-hoc usage when they provide type safety: core/server adapter `router` and `route`, `registerRoutes`, `createRouteHandler`, typed clients such as `fetch` and `fetchResponse`, TanStack Query `queryOptions`, streaming helpers such as `openConnection`, and exported helper types. At runtime much of the code may still be ordinary objects and functions; the value is that those objects and functions remain checked against the shared contract and the TypeScript type system.

## Packages

Use only packages required by the detected stack:

- `@rest-rpc/core`: contracts, clients, OpenAPI primitives
- `@rest-rpc/tanstack-query`: TanStack Query integration
- `@rest-rpc/express`: Express adapter
- `@rest-rpc/fastify`: Fastify adapter
- `@rest-rpc/hono`: Hono adapter
- `@rest-rpc/nest`: NestJS adapter
- `@rest-rpc/next`: Next.js adapter
- `@rest-rpc/fetch`: Server adapter for fetch-based runtimes (Next.js, Deno, Bun, Cloudflare Workers, etc.)
- `@rest-rpc/server`: Low-level server helpers. Ignore by default unless implementing a custom server adapter.

## When To Read Docs

The hosted docs are the source of truth for current APIs. Do not fetch docs for trivial architecture choices already covered here or on project's existing architecture. Do fetch docs before using unfamiliar exports, adding an integration, writing examples, or changing behavior that depends on exact package APIs.

Prefer targeted retrieval:

### Via MCP (Preferred)

The full documentation is available via MCP tools.

If tools are not installed they can be added using:

For Codex:

```bash
codex mcp add rest-rpc --url https://rest-rpc.dev/mcp
```

For Claude Code:

```bash
claude mcp add --transport http rest-rpc https://rest-rpc.dev/mcp
```

1. MCP `search_docs`
2. MCP `get_page`
3. MCP `list_pages` or `get_navigation` when discovery is needed

### Via fetching docs directly from the hosted site (only when MCP is unavailable)

Useful indexes:

- `https://rest-rpc.dev/agent-readability.json`
- `https://rest-rpc.dev/llms.txt`

### Via reading source code (when the documentation does not cover the needed details)

Read the source code from the installed package location. Exact paths differ based on package manager,
do not guess the install location and verify the path before reading. Each package ships `dist/` that contains
the transpiled JavaScript files and the TypeScript type declaration files. Each exported symbol is documented with
TSDoc comments. The source code is the ultimate source of truth for the current API, but it is not a substitute for the hosted docs.

## Project Workflow

For implementation tasks:

1. Inspect package manager, TypeScript config, framework/runtime, existing API shape, validation library, workspace layout, and installed `rest-rpc` versions.
2. Read targeted docs only when exact current API details are needed.
3. Install missing `rest-rpc` packages with the detected package manager.
4. Put shared contracts somewhere both server and client can import: a workspace package, shared app module, or app-local shared directory.
5. Use the server adapter that matches the project framework. Prefer normal framework organization such as Express routers, Fastify plugins, Hono route modules, NestJS modules, or framework catch-all routes.
6. Use adapter `router` and `route` for server implementation, and contract `router` and `route` for API declaration; they are related but not interchangeable.
7. Use `registerRoutes` when registering with a framework router. Use `createRouteHandler` when a runtime needs a custom matcher or catch-all handler.
8. Register routes in multiple modules when useful; neither contracts nor handlers need to be monolithic.
9. Use typed client helpers for direct calls. Use `@rest-rpc/tanstack-query` for query/mutation options and keys when the app already uses TanStack Query.
10. Let types infer from the contract. If inference is not enough, prefer exported helper types over new ad-hoc types.
