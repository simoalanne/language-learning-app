import { noBody, route, router } from "@rest-rpc/core";

export default router(
	{
		account: {
			remove: route({
				method: "DELETE",
				path: "/account",
				responses: {
					204: noBody(),
				},
			}),
		},
	},
	{
		metadata: {
			requiresAuth: true,
		},
	},
);
