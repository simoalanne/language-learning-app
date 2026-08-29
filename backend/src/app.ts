import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import express from "express";
import { accountRouter } from "./features/account/account.service.ts";
import { aiRouter } from "./features/ai/ai.service.ts";
import { wordGroupsRouter } from "./features/wordGroups/wordGroups.service.ts";

const app = express();

app.use(cors());
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

app.use("/", wordGroupsRouter);
app.use("/", aiRouter);
app.use("/", accountRouter);

export default app;
