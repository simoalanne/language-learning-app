import { router } from "@rest-rpc/core";
import aiContracts from "./ai.ts";
import wordGroupsContracts from "./wordGroups.ts";

export const contracts = router({
	...wordGroupsContracts,
	...aiContracts,
});

export type AppContracts = typeof contracts;
