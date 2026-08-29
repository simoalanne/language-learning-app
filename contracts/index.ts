import { router } from "@rest-rpc/core";
import accountContracts from "./account.ts";
import aiContracts from "./ai.ts";
import wordGroupsContracts from "./wordGroups.ts";

export const contracts = router(
	{
		...accountContracts,
		...wordGroupsContracts,
		...aiContracts,
	},
	{ pathPrefix: "/api" },
);

export type AppContracts = typeof contracts;
