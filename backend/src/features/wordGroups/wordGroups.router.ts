import { RouteError } from "@rest-rpc/server";
import { and, eq, isNull, sql } from "drizzle-orm";
import * as schema from "../../drizzle/schema.ts";
import { authed, base } from "../../rest-rpc.ts";
import {
	paginationInputSchema,
	wordGroupIdSchema,
	wordGroupInputSchema,
} from "./wordGroups.schemas.ts";

const toWordGroup = (group: typeof schema.word_groups.$inferSelect) => ({
	...group.data,
	id: group.id,
	createdAt: group.created_at,
	updatedAt: group.updated_at,
});

export const wordGroupsRouter = {
	public: {
		list: base
			.body(paginationInputSchema)
			.handler(async ({ body: { offset, limit }, context }) => {
				const [totalResult] = await context.db
					.select({ total: sql`count(*)` })
					.from(schema.word_groups)
					.where(isNull(schema.word_groups.user_id));

				const total = Number(totalResult.total);

				const query = context.db
					.select()
					.from(schema.word_groups)
					.where(isNull(schema.word_groups.user_id))
					.offset(offset ?? 0);

				const groups = limit ? await query.limit(limit) : await query;

				return {
					wordGroups: groups.map(toWordGroup),
					pagination: { total, limit: 0, offset: 0, pages: 1 },
				};
			}),
	},
	users: {
		list: authed
			.body(paginationInputSchema)
			.handler(async ({ context, body: { offset, limit } }) => {
				const [totalResult] = await context.db
					.select({ total: sql`count(*)` })
					.from(schema.word_groups)
					.where(eq(schema.word_groups.user_id, context.clerkId));
				const total = Number(totalResult.total);

				const query = context.db
					.select()
					.from(schema.word_groups)
					.where(eq(schema.word_groups.user_id, context.clerkId))
					.offset(offset ?? 0);

				const groups = limit ? await query.limit(limit) : await query;

				return {
					wordGroups: groups.map(toWordGroup),
					pagination: {
						total,
						limit: limit ?? total,
						offset: offset ?? 0,
						pages: limit ? Math.ceil(total / limit) : 1,
					},
				};
			}),
		getById: authed
			.body(wordGroupIdSchema)
			.handler(async ({ context, body }) => {
				const [group] = await context.db
					.select()
					.from(schema.word_groups)
					.where(
						and(
							eq(schema.word_groups.id, body.id),
							eq(schema.word_groups.user_id, context.clerkId),
						),
					);

				if (!group) {
					throw new RouteError("NOT_FOUND", {
						message: "Word group not found",
					});
				}

				return toWordGroup(group);
			}),
		create: authed
			.body(wordGroupInputSchema)
			.handler(async ({ context, body }) => {
				const [newGroup] = await context.db
					.insert(schema.word_groups)
					.values({ user_id: context.clerkId, data: body })
					.returning({ id: schema.word_groups.id });

				return { id: newGroup.id };
			}),
		createBulk: authed
			.body(wordGroupInputSchema.array().min(1))
			.handler(async ({ context, body }) => {
				const rows = await context.db
					.insert(schema.word_groups)
					.values(
						body.map((wordGroup) => ({
							user_id: context.clerkId,
							data: wordGroup,
						})),
					)
					.returning({ id: schema.word_groups.id });

				return { ids: rows.map((row) => row.id) };
			}),
		update: authed
			.body(wordGroupInputSchema.extend(wordGroupIdSchema.shape))
			.handler(async ({ context, body: { id, ...wordGroup } }) => {
				await context.db
					.update(schema.word_groups)
					.set({ data: wordGroup, updated_at: new Date() })
					.where(
						and(
							eq(schema.word_groups.id, id),
							eq(schema.word_groups.user_id, context.clerkId),
						),
					);
			}),
		remove: authed
			.body(wordGroupIdSchema)
			.handler(async ({ context, body }) => {
				await context.db
					.delete(schema.word_groups)
					.where(
						and(
							eq(schema.word_groups.id, body.id),
							eq(schema.word_groups.user_id, context.clerkId),
						),
					);
			}),
	},
};
