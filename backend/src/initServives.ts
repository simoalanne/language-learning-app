import { initServer } from "@contract-first-api/express";
import type { contracts } from "@language-learning-app/contracts";

export type AppRequestContext = {
	clerkId: string;
};

export const {
	createRouter,
	defineMiddleware,
	defineService,
	throwKnownError,
} = initServer<typeof contracts, AppRequestContext>();
