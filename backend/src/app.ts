import { clerkMiddleware } from "@clerk/express";
import { createCatchAllHandler, onError } from "@rest-rpc/server/node";
import cors from "cors";
import express from "express";
import { router } from "./router.ts";
import db from "./drizzle/db.ts";

const app = express();

const handler = createCatchAllHandler(router, {
	interceptors: [onError((error) => console.error(error))],
});

app.use(cors());
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

app.use("/api{/*path}", async (req, res, next) => {
	const { matched } = await handler(req, res, {
		mountPath: "/api",
		context: { req, db },
	});

	if (!matched) next();
});

export default app;
