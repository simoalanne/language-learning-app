import { route } from "@rest-rpc/core";
import z from "zod";

export {
	createBulkWordGroupsResponseSchema,
	createBulkWordGroupsSchema,
	languageNameSchema,
	paginatedWordGroupsResponseSchema,
	translationSchema,
	wordGroupIdParamsSchema,
	wordGroupInputSchema,
	wordGroupListQuerySchema,
	wordGroupMutationResponseSchema,
	wordGroupSchema,
} from "./wordGroups.schemas.ts";

import {
	createBulkWordGroupsResponseSchema,
	createBulkWordGroupsSchema,
	paginatedWordGroupsResponseSchema,
	wordGroupIdParamsSchema,
	wordGroupInputSchema,
	wordGroupListQuerySchema,
	wordGroupMutationResponseSchema,
	wordGroupSchema,
} from "./wordGroups.schemas.ts";

const apiRoute = route.with({
	pathPrefix: "/api",
	metadata: {
		requiresAuth: true,
	},
	strictStatusCodes: true,
});

export default {
	wordGroups: {
		public: {
			list: apiRoute
				.get("/word-groups/public")
				.query(wordGroupListQuerySchema)
				.response(200, paginatedWordGroupsResponseSchema),
		},
		users: {
			list: apiRoute
				.get("/word-groups/users")
				.query(wordGroupListQuerySchema)
				.response(200, paginatedWordGroupsResponseSchema),
			getById: apiRoute
				.get("/word-groups/users/:id")
				.params(z.object({ id: z.coerce.number<number>().int().positive() }))
				.response(200, wordGroupSchema),
			create: apiRoute
				.post("/word-groups/users")
				.body(wordGroupInputSchema)
				.response(201, wordGroupMutationResponseSchema),
			createBulk: apiRoute
				.post("/word-groups/users/bulk")
				.body(createBulkWordGroupsSchema)
				.response(201, createBulkWordGroupsResponseSchema),
			update: apiRoute
				.put("/word-groups/users/:id")
				.params(wordGroupIdParamsSchema)
				.body(wordGroupInputSchema)
				.response(204),
			remove: apiRoute
				.delete("/word-groups/users/:id")
				.params(wordGroupIdParamsSchema)
				.response(204),
		},
	},
};
