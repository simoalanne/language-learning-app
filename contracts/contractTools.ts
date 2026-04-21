import { initContracts } from "@contract-first-api/core";

export type ContractMeta = {
	requiresAuth: boolean;
};

export const contractTools = initContracts<ContractMeta>();
