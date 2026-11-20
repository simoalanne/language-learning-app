import { accountRouter } from "./features/account/account.router.ts";
import { aiRouter } from "./features/ai/ai.router.ts";
import { wordGroupsRouter } from "./features/wordGroups/wordGroups.router.ts";

export const router = {
	account: accountRouter,
	ai: aiRouter,
	wordGroups: wordGroupsRouter,
};

export type AppRouter = typeof router;
