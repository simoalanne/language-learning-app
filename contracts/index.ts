import accountContracts from "./account.ts";
import aiContracts from "./ai.ts";
import wordGroupsContracts from "./wordGroups.ts";

export const contracts = {
	...accountContracts,
	...wordGroupsContracts,
	...aiContracts,
};

export type AppContracts = typeof contracts;
