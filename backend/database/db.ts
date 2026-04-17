import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "./schema.js";
import { eq, and, sql, isNull } from "drizzle-orm";

let client;
export let db;
let isDbReady = false;

export const initDb = async () => {
  try {
    client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    await client.connect();
    db = drizzle(client, { schema });
    isDbReady = true;
    console.info("Database initialized");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  }
};

export const closeDb = async () => {
  isDbReady = false;
  if (client) {
    try {
      await client.end();
      db = null;
      console.info("Database closed");
    } catch (error) {
      console.error("Error closing database:", error);
    }
  }
};

export const isDbInitialized = () => isDbReady && client && !client.state?.closed;

/**
 * Adds a new word group to the database with JSONB storage.
 * @param {Object} wordGroupObj - { translations: [...], tags: [...] }
 * @param {number} userId - The ID of the user who owns the word group.
 * @returns {Promise<Object>} - The created word group with ID.
 */
export const addNewWordGroup = async (wordGroupObj, userId) => {
  try {
    const [newGroup] = await db
      .insert(schema.word_groups)
      .values({
        user_id: userId,
        data: wordGroupObj,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();

    return { id: newGroup.id };
  } catch (error) {
    console.error("Error adding word group:", error);
    throw error;
  }
};

/**
 * Updates an existing word group.
 * @param {Object} wordGroupObj - { translations: [...], tags: [...] }
 * @param {number} userId - The ID of the user who owns the word group.
 * @param {number} groupId - The ID of the word group to update.
 * @returns {Promise<Object>} - The updated word group.
 */
export const updateWordGroup = async (wordGroupObj, userId, groupId) => {
  try {
    await db
      .update(schema.word_groups)
      .set({
        data: wordGroupObj,
        updated_at: new Date(),
      })
      .where(and(eq(schema.word_groups.id, groupId), eq(schema.word_groups.user_id, userId)));

    return { id: groupId };
  } catch (error) {
    console.error("Error updating word group:", error);
    throw error;
  }
};

export const deleteWordGroupById = async (groupId, userId) => {
  await db
    .delete(schema.word_groups)
    .where(
      and(eq(schema.word_groups.id, groupId), eq(schema.word_groups.user_id, userId))
    );

};

export const getWordGroupById = async (groupId, userId) => {
  const [group] = await db
    .select()
    .from(schema.word_groups)
    .where(
      and(
        eq(schema.word_groups.id, groupId),
        userId ? eq(schema.word_groups.user_id, userId) : isNull(schema.word_groups.user_id)
      )
    );

  if (!group) {
    return null;
  }

  return {
    id: group.id,
    ...group.data,
    createdAt: group.created_at,
    updatedAt: group.updated_at,
  };
};

export const getMultipleWordGroups = async ({
  offset,
  limit,
  getAll,
  userId,
}) => {
  let query = db.select().from(schema.word_groups);

  if (userId) {
    query = query.where(eq(schema.word_groups.user_id, userId));
  } else {
    query = query.where(isNull(schema.word_groups.user_id));
  }

  query = query.orderBy(schema.word_groups.id);

  if (!getAll) {
    query = query.limit(limit).offset(offset);
  }

  const groups = await query;

  return groups.map((group) => ({
    id: group.id,
    ...group.data,
    createdAt: group.created_at,
    updatedAt: group.updated_at,
  }));
};

const getTotalds = async (tableName) => {
  if (tableName === "word_groups") {
    const result = await db
      .select({ count: sql`COUNT(*)` })
      .from(schema.word_groups);
    return parseInt(result[0].count, 10);
  } else if (tableName === "users") {
    const result = await db
      .select({ count: sql`COUNT(*)` })
      .from(schema.users);
    return parseInt(result[0].count, 10);
  } else {
    throw new Error(`Unknown table: ${tableName}`);
  }
};

export const getTotalAndPages = async (tableName, limit) => {
  const total = await getTotalds(tableName);
  const pages = Math.ceil(total / limit);
  return { total, pages };
};

export const upsertClerkUser = async ({
  clerkId,
  email,
  firstName,
  lastName,
}: {
  clerkId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
}) => {
  const [user] = await db
    .insert(schema.users)
    .values({
      clerk_id: clerkId,
      email,
      first_name: firstName,
      last_name: lastName,
    })
    .onConflictDoUpdate({
      target: schema.users.clerk_id,
      set: {
        email,
        first_name: firstName,
        last_name: lastName,
      },
    })
    .returning();

  return user;
};

export const deleteClerkUser = async (clerkId: string) => {
  await db.delete(schema.users).where(eq(schema.users.clerk_id, clerkId));
};

export const getUserByClerkId = async (clerkId: string) => {
  const user = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.clerk_id, clerkId));
  return user[0];
};
