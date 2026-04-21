import type { wordGroupInputSchema } from "@language-learning-app/contracts/wordGroups.ts";
import { relations } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core";
import type z from "zod";

export const users = p.pgTable("users", {
	clerk_id: p.text("clerk_id").primaryKey(),
	email: p.text("email"),
	first_name: p.text("first_name"),
	last_name: p.text("last_name"),
});

export const word_groups = p.pgTable("word_groups", {
	id: p.serial("id").primaryKey(),
	user_id: p.text("user_id").references(() => users.clerk_id, {
		onDelete: "cascade",
	}),
	data: p.jsonb("data").$type<z.infer<typeof wordGroupInputSchema>>().notNull(),
	created_at: p
		.timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updated_at: p
		.timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
	word_groups: many(word_groups),
}));

export const word_groupsRelations = relations(word_groups, ({ one }) => ({
	user: one(users, {
		fields: [word_groups.user_id],
		references: [users.clerk_id],
	}),
}));
