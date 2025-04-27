import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect();

export const query = async (text, params, { onlyFirstRow } = {}) => {
  const res = await client.query(text, params);
  return onlyFirstRow ? res.rows[0] : res.rows;
};

export const closeDb = async () => {
  await client.end();
};

/**
 * Adds a new word group to the database.
 *
 * @param {Object} wordGroupObj - The word group object to be added.
 * @param {number} userId - The ID of the user who owns the word group.
 * @returns {Promise<Object>} - The ID of the new word group.
 * @throws {Error} - If an error occurs during the insertion.
 */
export const addNewWordGroup = async (wordGroupObj, userId) => {
  const translations = wordGroupObj.translations.map((t) => ({
    word: t.word,
    language_name: t.languageName,
    synonyms: t.synonyms || []  // Default to empty array if no synonyms
  }));

  const res = await query(
    `WITH inserted_group AS (
        INSERT INTO word_groups (user_id)
        VALUES ($1)
        RETURNING id
      ),
      parsed_words AS (
        SELECT
          t.word,
          t.language_name::language_enum AS language,
          t.synonyms,
          inserted_group.id AS group_id
        FROM
          inserted_group,
          jsonb_to_recordset($2::jsonb) AS t(
            word text,
            language_name text,
            synonyms text[]
          )
      )
      INSERT INTO words (language, word, synonyms, group_id)
      SELECT language, word, synonyms, group_id FROM parsed_words
      RETURNING id`,  // Return the group ID here
    [userId, JSON.stringify(translations)],
    { onlyFirstRow: true }
  );

  return { id: res.id };  // Returning the group ID
};

export const updateWordGroup = async (wordGroupObj, userId, groupId) => {
  const translations = wordGroupObj.translations.map((t) => ({
    word: t.word,
    language_name: t.languageName,
    synonyms: t.synonyms || []
  }));

  await query(
    `
    -- Step 1: Update the groups updated_at timestamp
    WITH updated_group AS (
      UPDATE word_groups
      SET updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING id
    ),
    -- Step 2: Delete existing words for this group
    deleted_words AS (
      DELETE FROM words
      WHERE group_id = $1
    ),
    -- Step 3: Parse and insert new words
    parsed_words AS (
      SELECT
        t.word,
        t.language_name::language_enum AS language,
        t.synonyms,
        $1 AS group_id
      FROM jsonb_to_recordset($3::jsonb) AS t(
        word text,
        language_name text,
        synonyms text[]
      )
    )
    INSERT INTO words (language, word, synonyms, group_id)
    SELECT language, word, synonyms, group_id FROM parsed_words
    RETURNING id
    `,
    [groupId, userId, JSON.stringify(translations)],
    { onlyFirstRow: false }
  );
};


/**
 * Deletes a word group from the database.
 *
 * @param {number} groupId - The ID of the word group to delete.
 * @param {number} userId - The ID of the user who owns the word group.
 * @returns {Promise<void>}
 * @throws {Error} - If an error occurs during the deletion.
 */
export const deleteWordGroupById = async (groupId, userId) => {
  await query("DELETE FROM word_groups WHERE id = $1 AND user_id = $2",
    [groupId, userId]
  );
};

/**
 * Gets a word group by its ID.
 *
 * @param {number} groupId - The ID of the word group to get.
 * @param {number} userId - The ID of the user who owns the word group.
 * @returns {Promise<Object>} - The word group object.
 * @throws {Error} - If an error occurs during the query.
 */
export const getWordGroupById = async (groupId, userId) => {
  return [];
};

/**
 * Gets all word groups from the database.
 *
 * @param {number} offset - The offset for pagination.
 * @param {number} limit - The limit for pagination.
 * @param {boolean} getAll - If true, gets all word groups.
 * @param {number} userId - The ID of the user who owns the word groups.
 * @returns {Promise<Object[]>} - An array of word group objects.
 * @throws {Error} - If an error occurs during the query.
 */
export const getMultipleWordGroups = async (userId) => {
  const groups = await query(
    `
    SELECT
      wg.id,
      wg.updated_at,
      json_agg(
        json_build_object(
          'word', w.word,
          'languageName', w.language,
          'synonyms', COALESCE(w.synonyms, '{}')
        )
      ) AS translations
    FROM word_groups wg
    LEFT JOIN words w ON wg.id = w.group_id
    GROUP BY wg.id, wg.updated_at
    ORDER BY wg.updated_at DESC
    `,
    [userId]
  );

  return groups.map((group) => ({ ...group, tags: [] })); // so frontend is compatible with newer version
};

/**
 * Returns the total amount of rows in a table.
 *
 * @param {string} tableName - The name of the table.
 * @returns {Promise<number>} - The total amount of rows.
 */
const getTotalds = async (tableName) => {
  const query = `SELECT COUNT(*) AS total FROM ${tableName}`;
  const total = await sqlQuery(query);
  return total[0].total;
};

/**
 * Returns the total amount of rows in a table and the amount of pages that can be created with the given limit.
 *
 * @param {string} tableName - The name of the table.
 * @param {number} limit - The amount of entries per page.
 * @returns {Promise<Object>} - The total amount of rows and the amount of pages.
 */
export const getTotalAndPages = async (tableName, limit) => {
  const total = await getTotalds(tableName);
  const pages = Math.floor(total / limit);
  return { total, pages };
};

/**
 * Gets a user by their username.
 *
 * @param {string} username - The username of the user.
 * @returns {Promise<Object>} - The user object with the username and hashed password.
 */
export const getUserByUsername = async (username) => {
  const user = await query("SELECT * FROM users WHERE username = $1", [username], {
    onlyFirstRow: true,
  });
  if (!user) {
    return null;
  }
  return {...user, password: user?.password_hash };
};

/**
 * Adds a new user to the database.
 *
 * @param {string} username - The username of the user.
 * @param {string} password - The hashed password of the user.
 * @returns {Promise<number>} - The ID of the new user.
 */
export const addUser = async (username, password) => {
  try {
    const id = await query(
      `INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id`,
      [username, password],
      { onlyFirstRow: true }
    );
    return id.id;
  } catch (error) {
    return { error: "Internal server error" };
  }
};
