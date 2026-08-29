import path, { join } from "node:path";
import { fileURLToPath } from "node:url";
import { clerkMiddleware } from "@clerk/express";
import express from "express";
import { aiRouter } from "./features/ai/ai.service.ts";
import { wordGroupsRouter } from "./features/wordGroups/wordGroups.service.ts";
import { mountClerkWebhook } from "./integrations/clerk/clerk.webhook.ts";

const app = express();

mountClerkWebhook(app);
app.use(express.json());
app.use(clerkMiddleware());

app.use((_, res, next) => {
	res.setHeader(
		"X-Backend-Version",
		process.env.RENDER_GIT_COMMIT || "unknown",
	);
	next();
});

app.get("/api/health", (_, res) => {
	const gitCommit = process.env.RENDER_GIT_COMMIT || "unknown";
	const gitBranch = process.env.RENDER_GIT_BRANCH || "unknown";
	const nodeVersion = process.version;
	const uptime = process.uptime();

	res.json({
		status: "ok",
		gitCommit,
		gitBranch,
		nodeVersion,
		uptime,
	});
});

app.use("/api", wordGroupsRouter);
app.use("/api", aiRouter);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicPath = path.join(__dirname, "../../frontend/dist");

app.use(express.static(publicPath));
app.get("/*splat", (_, res) => {
	res.sendFile(join(publicPath, "index.html"));
});

export default app;
