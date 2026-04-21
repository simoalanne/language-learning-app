import type {
	ContractApiRequest,
	ContractApiResponse,
	DotPaths,
} from "@contract-first-api/core";
import aiContracts from "./ai.ts";
import { contractTools } from "./contractTools.ts";

export type { ContractMeta } from "./contractTools.ts";
export { contractTools } from "./contractTools.ts";

import wordGroupsContracts from "./wordGroups.ts";

export const contracts = contractTools.mergeContracts(
	wordGroupsContracts,
	aiContracts,
);

export type AppContracts = typeof contracts;
export type AppContractPaths = DotPaths<AppContracts>;

export type ApiRequest<P extends AppContractPaths> = ContractApiRequest<
	AppContracts,
	P
>;

export type ApiResponse<P extends AppContractPaths> = ContractApiResponse<
	AppContracts,
	P
>;
