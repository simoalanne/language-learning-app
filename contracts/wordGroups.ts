import z from "zod";
import { contractTools } from "./contractTools.ts";

export {
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
	createBulkWordGroupsSchema,
	paginatedWordGroupsResponseSchema,
	wordGroupIdParamsSchema,
	wordGroupInputSchema,
	wordGroupListQuerySchema,
	wordGroupSchema,
} from "./wordGroups.schemas.ts";

export default contractTools.defineContract({
	wordGroups: {
		public: {
			list: {
				method: "GET",
				path: "/word-groups/public",
				request: {
					query: wordGroupListQuerySchema,
				},
				response: paginatedWordGroupsResponseSchema,
			},
		},
		users: {
			list: {
				method: "GET",
				path: "/word-groups/users",
				request: {
					query: wordGroupListQuerySchema,
				},
				response: paginatedWordGroupsResponseSchema,
				meta: {
					requiresAuth: true,
				},
			},
			getById: {
				method: "GET",
				path: "/word-groups/users/:id",
				request: {
					params: z.object({ id: z.coerce.number() }),
				},
				response: wordGroupSchema,
				meta: {
					requiresAuth: true,
				},
			},
			create: {
				method: "POST",
				path: "/word-groups/users",
				request: {
					body: wordGroupInputSchema,
				},
				response: z.int(),
				meta: {
					requiresAuth: true,
				},
			},
			createBulk: {
				method: "POST",
				path: "/word-groups/users/bulk",
				request: {
					body: createBulkWordGroupsSchema,
				},
				response: z.int().array(),
				meta: {
					requiresAuth: true,
				},
			},
			update: {
				method: "PUT",
				path: "/word-groups/users/:id",
				request: {
					params: wordGroupIdParamsSchema,
					body: wordGroupInputSchema,
				},
				response: z.null(),
				meta: {
					requiresAuth: true,
				},
			},
			remove: {
				method: "DELETE",
				path: "/word-groups/users/:id",
				request: {
					params: wordGroupIdParamsSchema,
				},
				response: z.null(),
				meta: {
					requiresAuth: true,
				},
			},
		},
	},
});
