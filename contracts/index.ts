import { router } from "@rest-rpc/core";
import aiContracts from "./ai.ts";
import wordGroupsContracts from "./wordGroups.ts";

export const contracts = router({
	...wordGroupsContracts,
	...aiContracts,
}, { pathPrefix: "/api" });

export type AppContracts = typeof contracts;
