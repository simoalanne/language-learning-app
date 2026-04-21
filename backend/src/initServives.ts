import { initServices } from "@contract-first-api/express";
import type { ContractMeta, contracts } from "@language-learning-app/contracts";

export type AppRequestContext = {
	clerkId: string;
};

export const { defineService, defineMiddleware } = initServices<
	typeof contracts,
	ContractMeta,
	AppRequestContext
>();
