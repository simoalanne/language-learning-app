import { createApp, onError } from "@rest-rpc/server";
import db from "./drizzle/db.ts";
import { router } from "./router.ts";

export const api = createApp(router, {
	mountPath: "/api",
	context: (request) => ({ request, db }),
	interceptors: [onError((error) => console.error(error))],
});
