// Vercel Function entry, bundled into api/_server.js by `bun run build`.
// Vercel serves the static frontend from dist/ and rewrites /api/* here
// with the original path; HTML imports are not supported there.
import { api } from "./api.ts";

Bun.serve({ fetch: api.fetch });
