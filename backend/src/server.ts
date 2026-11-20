// Local server: API plus the frontend bundled on the fly through Bun's HTML import.
import { readdirSync } from "node:fs";
import { join } from "node:path";
import index from "../../frontend/index.html";
import { api } from "./api.ts";

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
