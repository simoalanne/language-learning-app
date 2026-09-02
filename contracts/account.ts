import { route } from "@rest-rpc/core";

export default {
	account: {
		remove: route
			.delete("/account")
			.response(204)
			.withMetadata({ requiresAuth: true }),
	},
};
