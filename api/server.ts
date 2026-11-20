// Vercel Function entrypoint. Vercel serves the static frontend from dist/
// and rewrites /api/* here; HTML imports are not supported on Vercel.
import { api } from "../backend/src/api.ts";

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
