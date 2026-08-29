import { contracts } from "@language-learning-app/contracts";
import { registerRoutes, router } from "@rest-rpc/express";
import { and, eq, isNull, sql } from "drizzle-orm";
import { Router } from "express";
import db from "../../drizzle/db.ts";
import * as schema from "../../drizzle/schema.ts";
import { attachClerkId } from "../../middleware/attachClerkId.ts";

const wordGroupsService = router(contracts.wordGroups, {
	public: {
		list: async ({ offset, limit }) => {
			const [totalResult] = await db
				.select({ total: sql`count(*)` })
				.from(schema.word_groups)
				.where(isNull(schema.word_groups.user_id));

			const total = Number(totalResult.total);

			const base = db
				.select()
				.from(schema.word_groups)
				.where(isNull(schema.word_groups.user_id))
				.offset(offset ?? 0);

			const groups = limit ? await base.limit(limit) : await base;

			const wordGroups = groups.map((g) => ({
				...g.data,
				id: g.id,
				createdAt: g.created_at,
				updatedAt: g.updated_at,
			}));
			return {
				wordGroups,
				pagination: { total, limit: 0, offset: 0, pages: 1 },
			};
		},
	},
	users: {
		list: async ({ context, offset, limit }) => {
			const [totalResult] = await db
				.select({ total: sql`count(*)` })
				.from(schema.word_groups)
				.where(eq(schema.word_groups.user_id, context.req.clerkId));
			const total = Number(totalResult.total);

			const base = db
				.select()
				.from(schema.word_groups)
				.where(eq(schema.word_groups.user_id, context.req.clerkId))
				.offset(offset ?? 0);

			const groups = limit ? await base.limit(limit) : await base;

			const wordGroups = groups.map((g) => ({
				...g.data,
				id: g.id,
				createdAt: g.created_at,
				updatedAt: g.updated_at,
			}));

			return {
				wordGroups,
				pagination: {
					total,
					limit: limit ?? total,
					offset: offset ?? 0,
					pages: limit ? Math.ceil(total / limit) : 1,
				},
			};
		},
		getById: async ({ context, id }) => {
			const [group] = await db
				.select()
				.from(schema.word_groups)
				.where(
					and(
						eq(schema.word_groups.id, id),
						eq(schema.word_groups.user_id, context.req.clerkId),
					),
				);

			if (!group) {
				throw new Error("Word group not found");
			}

			return {
				...group?.data,
				id: group?.id,
				createdAt: group?.created_at,
				updatedAt: group?.updated_at,
			};
		},
		create: async ({ context, translations, tags }) => {
			const [newGroup] = await db
				.insert(schema.word_groups)
				.values({
					user_id: context.req.clerkId,
					data: {
						translations,
						tags,
					},
				})
				.returning({ id: schema.word_groups.id });

			return { id: newGroup.id };
		},
		createBulk: async ({ context, bulkData }) => {
			const data = await db
				.insert(schema.word_groups)
				.values(
					bulkData.map((wordGroup) => ({
						user_id: context.req.clerkId,
						data: wordGroup,
					})),
				)
				.returning({ id: schema.word_groups.id });

			return { ids: data.map((d) => d.id) };
		},
		update: async ({ context, id, ...wordGroup }) => {
			await db
				.update(schema.word_groups)
				.set({
					data: wordGroup,
					updated_at: new Date(),
				})
				.where(
					and(
						eq(schema.word_groups.id, id),
						eq(schema.word_groups.user_id, context.req.clerkId),
					),
				);
		},
		remove: async ({ context, id }) => {
			await db
				.delete(schema.word_groups)
				.where(
					and(
						eq(schema.word_groups.id, id),
						eq(schema.word_groups.user_id, context.req.clerkId),
					),
				);
		},
	},
});

export const wordGroupsRouter = Router();

registerRoutes(wordGroupsRouter, wordGroupsService, {
	middleware: [attachClerkId],
});
