import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

/**
 * Simplified word_groups table with JSONB storage
 * data structure:
 * {
 *   translations: [
 *     {
 *       languageName: string,
 *       word: string,
 *       synonyms: string[]
 *     }
 *   ],
 *   tags: string[]
 * }
 */
export const word_groups = pgTable("word_groups", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  data: jsonb("data").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Simple relations - just user to word_groups
export const usersRelations = relations(users, ({ many }) => ({
  word_groups: many(word_groups),
}));

export const word_groupsRelations = relations(word_groups, ({ one }) => ({
  user: one(users, {
    fields: [word_groups.user_id],
    references: [users.id],
  }),
}));
