import { readdirSync } from "node:fs";
import { join } from "node:path";
import { createApp, onError } from "@rest-rpc/server";
import index from "../../frontend/index.html";
import db from "./drizzle/db.ts";
import { router } from "./router.ts";

const api = createApp(router, {
	mountPath: "/api",
	context: (request) => ({ request, db }),
	interceptors: [onError((error) => console.error(error))],
});

const publicDir = join(import.meta.dir, "../../frontend/public");
const publicFiles = Object.fromEntries(
	readdirSync(publicDir).map((file) => [
		`/${file}`,
		new Response(Bun.file(join(publicDir, file))),
	]),
);

const server = Bun.serve({
	port: process.env.PORT || 3000,
	routes: {
		...publicFiles,
		...api.routes,
		"/api/*": Response.json({ code: "NOT_FOUND" }, { status: 404 }),
		"/*": index,
	},
	development: process.env.NODE_ENV !== "production" && { hmr: true },
});

console.log(`Server running at ${server.url}`);
