import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "./schema.js";
import { eq, and, sql, isNull } from "drizzle-orm";

let client;
export let db;
let isDbReady = false;

/**
 * Initializes the database connection
 * Database schema must exist (created via migrations)
 *
 * @returns {Promise<void>}
 * @throws {Error} - If connection fails
 */
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
 * @param {string | null | undefined} userId - The Clerk ID of the user who owns the word group.
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
 * @param {string} userId - The Clerk ID of the user who owns the word group.
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

/**
 * Deletes a word group from the database.
 * 
 * @param {number} groupId - The ID of the word group to delete.
 * @param {string} userId - The Clerk ID of the user who owns the word group.
 * @returns {Promise<void>}
 * @throws {Error} - If an error occurs during the deletion.
 */
export const deleteWordGroupById = async (groupId, userId) => {
  try {
    await db
      .delete(schema.word_groups)
      .where(
        and(eq(schema.word_groups.id, groupId), eq(schema.word_groups.user_id, userId))
      );
  } catch (error) {
    console.error("Error deleting word group:", error);
    throw error;
  }
};


/**
 * Gets a word group by its ID.
 *
 * @param {number} groupId - The ID of the word group to get.
 * @param {string | null | undefined} userId - The Clerk ID of the user who owns the word group.
 * @returns {Promise<Object>} - The word group object.
 * @throws {Error} - If an error occurs during the query.
 */
/**
 * Gets a word group by its ID.
 * @param {number} groupId - The ID of the word group to get.
 * @param {number} userId - The ID of the user who owns the word group.
 * @returns {Promise<Object|null>} - The word group with JSONB data.
 */
export const getWordGroupById = async (groupId, userId) => {
  try {
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
  } catch (error) {
    console.error("Error getting word group by ID:", error);
    throw error;
  }
};

/**
 * Gets all word groups from the database with pagination.
 * @param {number} offset - The offset for pagination.
 * @param {number} limit - The limit for pagination.
 * @param {boolean} getAll - If true, gets all word groups.
 * @param {string | null | undefined} userId - The Clerk ID of the user who owns the word groups.
 * @returns {Promise<Object[]>} - An array of word group objects with JSONB data.
 */
export const getMultipleWordGroups = async ({
  offset,
  limit,
  getAll,
  userId,
}) => {
  try {
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
  } catch (error) {
    console.error("Error getting multiple word groups:", error);
    throw error;
  }
};

/**
 * Returns the total amount of rows in a table.
 * @param {string} tableName - The name of the table.
 * @returns {Promise<number>} - The total amount of rows.
 */
const getTotalds = async (tableName) => {
  try {
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
  } catch (error) {
    console.error("Error getting total:", error);
    throw error;
  }
};

/**
 * Returns the total amount of rows in a table and the amount of pages that can be created with the given limit.
 * @param {string} tableName - The name of the table.
 * @param {number} limit - The amount of entries per page.
 * @returns {Promise<Object>} - The total amount of rows and the amount of pages.
 */
export const getTotalAndPages = async (tableName, limit) => {
  try {
    const total = await getTotalds(tableName);
    const pages = Math.ceil(total / limit);
    return { total, pages };
  } catch (error) {
    console.error("Error getting total and pages:", error);
    throw error;
  }
};

/**
 * Upserts a Clerk user snapshot into the local database.
 *
 * @param {{ clerkId: string, email: string | null, firstName: string | null, lastName: string | null }} userData
 * @returns {Promise<Object>} - The upserted user row.
 */
export const upsertClerkUser = async ({ clerkId, email, firstName, lastName }) => {
  try {
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
  } catch (error) {
    console.error("Error upserting Clerk user:", error);
    throw error;
  }
};

/**
 * Deletes a Clerk user snapshot from the local database.
 *
 * @param {string} clerkId - The Clerk user ID.
 * @returns {Promise<void>}
 */
export const deleteClerkUser = async (clerkId) => {
  try {
    await db
      .delete(schema.users)
      .where(eq(schema.users.clerk_id, clerkId));
  } catch (error) {
    console.error("Error deleting Clerk user:", error);
    throw error;
  }
};

/**
 * Gets a user by their Clerk ID.
 *
 * @param {string} clerkId - The Clerk user ID.
 * @returns {Promise<Object | undefined>} - The user object.
 */
export const getUserByClerkId = async (clerkId) => {
  try {
    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.clerk_id, clerkId));
    return user[0];
  } catch (error) {
    console.error("Error getting user by Clerk ID:", error);
    throw error;
  }
};
