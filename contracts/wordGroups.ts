import { noBody, route, router } from "@rest-rpc/core";
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

export default router({
	wordGroups: {
		public: router({
			list: route({
				method: "GET",
				path: "/word-groups/public",
				query: wordGroupListQuerySchema,
				response: paginatedWordGroupsResponseSchema,
			}),
		}),
		users: router(
			{
				list: route({
					method: "GET",
					path: "/word-groups/users",
					query: wordGroupListQuerySchema,
					response: paginatedWordGroupsResponseSchema,
				}),
				getById: route({
					method: "GET",
					path: "/word-groups/users/:id",
					pathParams: z.object({ id: z.coerce.number() }),
					response: wordGroupSchema,
				}),
				create: route({
					method: "POST",
					path: "/word-groups/users",
					body: wordGroupInputSchema,
					response: wordGroupMutationResponseSchema,
				}),
				createBulk: route({
					method: "POST",
					path: "/word-groups/users/bulk",
					body: createBulkWordGroupsSchema,
					response: createBulkWordGroupsResponseSchema,
				}),
				update: route({
					method: "PUT",
					path: "/word-groups/users/:id",
					pathParams: wordGroupIdParamsSchema,
					body: wordGroupInputSchema,
					responses: {
						204: noBody(),
					},
				}),
				remove: route({
					method: "DELETE",
					path: "/word-groups/users/:id",
					pathParams: wordGroupIdParamsSchema,
				}),
			},
			{
				metadata: {
					requiresAuth: true,
				},
			},
		),
	},
});
