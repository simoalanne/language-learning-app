// Vercel Function entry, bundled into api/_server.js by `bun run build`.
// Vercel serves the static frontend from dist/ and rewrites /api/* to the
// function; HTML imports are not supported there.
import { api } from "./api.ts";

Bun.serve({
	fetch(request) {
		// Accept the path both as requested and as rewritten to /api/server/*.
		const url = new URL(request.url);
		const pathname = url.pathname.replace(/^\/api\/server(?=\/|$)/, "/api");
		if (pathname === url.pathname) return api.fetch(request);
		url.pathname = pathname;
		return api.fetch(new Request(url, request));
	},
});
