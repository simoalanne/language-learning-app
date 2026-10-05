import { ORPCError } from "@orpc/server";
import { and, eq, isNull, sql } from "drizzle-orm";
import db from "../../drizzle/db.ts";
import * as schema from "../../drizzle/schema.ts";
import { authed, base } from "../../orpc.ts";
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
			.input(paginationInputSchema)
			.handler(async ({ input: { offset, limit } }) => {
				const [totalResult] = await db
					.select({ total: sql`count(*)` })
					.from(schema.word_groups)
					.where(isNull(schema.word_groups.user_id));

				const total = Number(totalResult.total);

				const query = db
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
			.input(paginationInputSchema)
			.handler(async ({ context, input: { offset, limit } }) => {
				const [totalResult] = await db
					.select({ total: sql`count(*)` })
					.from(schema.word_groups)
					.where(eq(schema.word_groups.user_id, context.clerkId));
				const total = Number(totalResult.total);

				const query = db
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
			.input(wordGroupIdSchema)
			.handler(async ({ context, input }) => {
				const [group] = await db
					.select()
					.from(schema.word_groups)
					.where(
						and(
							eq(schema.word_groups.id, input.id),
							eq(schema.word_groups.user_id, context.clerkId),
						),
					);

				if (!group) {
					throw new ORPCError("NOT_FOUND", {
						message: "Word group not found",
					});
				}

				return toWordGroup(group);
			}),
		create: authed
			.input(wordGroupInputSchema)
			.handler(async ({ context, input }) => {
				const [newGroup] = await db
					.insert(schema.word_groups)
					.values({ user_id: context.clerkId, data: input })
					.returning({ id: schema.word_groups.id });

				return { id: newGroup.id };
			}),
		createBulk: authed
			.input(wordGroupInputSchema.array().min(1))
			.handler(async ({ context, input }) => {
				const rows = await db
					.insert(schema.word_groups)
					.values(
						input.map((wordGroup) => ({
							user_id: context.clerkId,
							data: wordGroup,
						})),
					)
					.returning({ id: schema.word_groups.id });

				return { ids: rows.map((row) => row.id) };
			}),
		update: authed
			.input(wordGroupInputSchema.extend(wordGroupIdSchema.shape))
			.handler(async ({ context, input: { id, ...wordGroup } }) => {
				await db
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
			.input(wordGroupIdSchema)
			.handler(async ({ context, input }) => {
				await db
					.delete(schema.word_groups)
					.where(
						and(
							eq(schema.word_groups.id, input.id),
							eq(schema.word_groups.user_id, context.clerkId),
						),
					);
			}),
	},
};
