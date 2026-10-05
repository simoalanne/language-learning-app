import { clerkMiddleware } from "@clerk/express";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/node";
import cors from "cors";
import express from "express";
import { router } from "./router.ts";

const app = express();

const rpcHandler = new RPCHandler(router, {
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

app.use("/rpc{/*path}", async (req, res, next) => {
	const { matched } = await rpcHandler.handle(req, res, {
		prefix: "/rpc",
		context: { req },
	});

	if (!matched) next();
});

export default app;
