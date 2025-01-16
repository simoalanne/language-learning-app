import sqlite3 from "sqlite3";
const db = new sqlite3.Database(":memory:");
import {
  commonWords,
  verbs,
  adjectives,
  sports,
  animals,
} from "./addStartingTranslations.js";

/**
 * Initializes the database by creating following tables:
 * - languages: contains language name and id
 * - words: contains word, language id and group id it belongs to
 * - word_synonyms: contains word id and synonym
 * - word_groups: contains metadata, id and user id to tie the word groups to specific user
 * - tags: contains tag name and id
 * - word_group_tags: many to many table to link word groups and tags together to allow storing multiple tags for a word group
 * - users: contains username and password
 * - Also inserts starting data for frontend to use
 * 
 * @returns {Promise<void>}
 * @throws {Error} - If an error occurs during the database initialization.
 */
export const initDb = async () => {
  try {
    const createTableQueries = [
      `CREATE TABLE languages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    language_name TEXT NOT NULL
  )`,
      `CREATE TABLE words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    language_id INTEGER REFERENCES languages (id),
    word TEXT NOT NULL,
    group_id INTEGER REFERENCES word_groups (id) ON DELETE CASCADE
  )`,
      `CREATE TABLE word_synonyms (
    word_id INTEGER REFERENCES words (id) ON DELETE CASCADE,
    synonym TEXT NOT NULL,
    PRIMARY KEY (word_id, synonym)
  )`,
      `CREATE TABLE word_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    group_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL
  )`,
      `CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word_group_id INTEGER REFERENCES word_groups (id) ON DELETE CASCADE, -- if word group is deleted, delete the tag link as well
    tag_name TEXT NOT NULL
  )`,
      `CREATE TABLE word_group_tags (
    word_group_id INTEGER REFERENCES word_groups (id) ON DELETE CASCADE, -- if word group is deleted, delete the tag link as well
    tag_id INTEGER REFERENCES tags (id) ON DELETE CASCADE,
    PRIMARY KEY (word_group_id, tag_id)
  )`,
      `CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`,
    ];

    const insertDataQueries = [
      `INSERT INTO languages (language_name) VALUES ("English")`,
      `INSERT INTO languages (language_name) VALUES ("Finnish")`,
      `INSERT INTO languages (language_name) VALUES ("French")`,
      `INSERT INTO languages (language_name) VALUES ("German")`,
      `INSERT INTO languages (language_name) VALUES ("Spanish")`,
      `INSERT INTO languages (language_name) VALUES ("Swedish")`,
    ];

    for (const query of createTableQueries) {
      await insertRawSql(query);
    }

    for (const query of insertDataQueries) {
      await insertRawSql(query);
    }

    const words = [
      ...commonWords,
      ...verbs,
      ...adjectives,
      ...sports,
      ...animals,
    ];
    // insert starting translations.
    // array elements are template strings so they can be directly inserted into the query
    // total of 300 words are inserted, 100 for each language
    for (const word of words) {
      await insertRawSql(
        `INSERT INTO words (language_id, word, group_id) VALUES ${word}`
      );
    }

    // get the english words to use as group names
    const englishWords = await sqlQuery(
      "SELECT word FROM words WHERE language_id = 1"
    );

    // insert starting word groups
    for (const word of englishWords) {
      // for groups that belong to database itself user_id and created_at and updated_at are NULL because this data is not editable
      await insertRawSql(
        `INSERT INTO word_groups (group_name, created_at, updated_at) VALUES ("${word.word}", NULL, NULL)`
      );
    }

    // insert starting tags
    const tags = ["common words", "verbs", "adjectives", "sports", "animals"];
    for (const tag of tags) {
      await insertRawSql(`INSERT INTO tags (tag_name) VALUES ("${tag}")`);
    }

    // link the starting tags to the starting word groups. tag index changes after looping through 20 groups
    let tagIndex = 1;

    for (let i = 1; i <= words.length / 3; i++) {
      await insertRawSql(
        `INSERT INTO word_group_tags (word_group_id, tag_id) VALUES (${i}, ${tagIndex})`
      );
      if (i % 20 === 0) {
        tagIndex++;
      }
    }

    // enable foreign key constraints
    await insertRawSql("PRAGMA foreign_keys = ON");
    console.info("Database initialized");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export const closeDb = () => {
  db.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.info("Database closed");
  });
};

/**
 * Helper function that adds new data to a table if it doesn't exist, and returns the ID of the data.
 * This is used when adding new languages, tags, etc and the id of the data is needed in other queries.
 *
 * @param {string} table - The table name.
 * @param {Array<string>} columns - The columns to check if the data already exists.
 * @param {Array<any>} values - The values to check if the data already exists.
 * @param {string} whatToSelect - The columns to select if the data already exists. optional default is "id".
 * @returns {Promise<number>} - The ID of the row.
 * @example getIdOrInsertNewData("languages", "[language_name]", ["English"]);
 */
const getIdOrInsertNewData = (table, columns, values, whatToSelect) => {
  return new Promise((resolve, reject) => {
    const placeholders = columns.map(() => "?").join(", ");
    const whereClause = columns.map((column) => `${column} = ?`).join(" AND ");

    db.serialize(() => {
      db.get(
        `SELECT ${whatToSelect || "id"} FROM ${table} WHERE ${whereClause}`,
        values,
        (err, row) => {
          if (err) return reject(err);
          if (row) return resolve(row.id);

          db.run(
            `INSERT INTO ${table} (${columns.join(
              ", "
            )}) VALUES (${placeholders})`,
            values,
            function (err) {
              if (err) return reject(err);
              resolve(this.lastID);
            }
          );
        }
      );
    });
  });
};
/**
 * Helper function to insert raw SQL into the database.
 * this does not sanitize the input so it should not be used with user input.
 *
 * @param {string} sql - The SQL query to run.
 * @returns {Promise<number>} - The ID of the last inserted row.
 * @example insertRawSql("INSERT INTO languages (language_name) VALUES ('English')");
 */
const insertRawSql = (sql) => {
  return new Promise((resolve, reject) => {
    db.run(sql, function (err) {
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
};

/**
 * Helper function to insert data into a table. Does not check if the data already exists.
 *
 * @param {string} table - The table name.
 * @param {string[]} columns - The columns to insert data into.
 * @param {any[]} values - The values to insert.
 * @returns {Promise<number>} - The ID of the last inserted row.
 * @example insertData("words", ["language_id", "primary_word"], [1, "Hello"]);
 */
const insertData = (table, columns, values) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values
      .map(() => "?")
      .join(", ")})`;

    db.run(query, values, function (err) {
      // Can't use arrow function because this will be undefined otherwise
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
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
  // Insert the group into the word_groups table first
  const groupId = await insertData(
    "word_groups",
    ["group_name", "user_id", "updated_at"],
    [wordGroupObj.translations[0].word, userId, null]
  );

  // Get language IDs
  const languageIds = await Promise.all(
    wordGroupObj.translations.map(async (translations) => {
      const languageName = translations.languageName;
      const languageId = await sqlQuery(
        "SELECT id FROM languages WHERE language_name = ?",
        [languageName]
      );
      return languageId[0].id;
    })
  );

  // Add words to db and get the word IDs
  const wordIds = await Promise.all(
    wordGroupObj.translations.map(async (translations, index) => {
      return await insertData(
        "words",
        ["language_id", "word", "group_id"],
        [languageIds[index], translations.word, groupId]
      );
    })
  );

  // Add synonyms to db for each word using the word IDs
  await Promise.all(
    wordGroupObj.translations.map(async (translations, index) => {
      await Promise.all(
        translations.synonyms.map(async (synonym) => {
          await insertData(
            "word_synonyms",
            ["word_id", "synonym"],
            [wordIds[index], synonym]
          );
        })
      );
    })
  );

  // Add tags to db that don't exist and get all the tag IDs
  const tagIds = await Promise.all(
    wordGroupObj.tags.map((tag) =>
      getIdOrInsertNewData("tags", ["tag_name"], [tag])
    )
  );

  // Add the tag IDs to the word_group_tags table to link them to the group ID
  await Promise.all(
    tagIds.map((tagId) =>
      insertData(
        "word_group_tags",
        ["word_group_id", "tag_id"],
        [groupId, tagId]
      )
    )
  );

  return { id: groupId };
};

export const updateWordGroup = async (wordGroupObj, userId, groupId) => {
  // Update the group name in the word_groups table
  await sqlRun(
    "UPDATE word_groups SET group_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
    [wordGroupObj.translations[0].word, groupId, userId]
  );

  // Get language IDs
  const languageIds = await Promise.all(
    wordGroupObj.translations.map(async (translations) => {
      const languageName = translations.languageName;
      const languageId = await sqlQuery(
        "SELECT id FROM languages WHERE language_name = ?",
        [languageName]
      );
      return languageId[0].id;
    })
  );

  // delete old words
  await sqlRun("DELETE FROM words WHERE group_id = ?", [groupId]);

  // Add words to db and get the word IDs
  const wordIds = await Promise.all(
    wordGroupObj.translations.map(
      async (translations, index) =>
        await insertData(
          "words",
          ["language_id", "word", "group_id"],
          [languageIds[index], translations.word, groupId]
        )
    )
  );

  // Add synonyms to db for each word using the word IDs
  await Promise.all(
    wordGroupObj.translations.map(async (translations, index) => {
      await Promise.all(
        translations.synonyms.map(async (synonym) => {
          await insertData(
            "word_synonyms",
            ["word_id", "synonym"],
            [wordIds[index], synonym]
          );
        })
      );
    })
  );

  // Add tags to db that don't exist and get all the tag IDs
  const tagIds = await Promise.all(
    wordGroupObj.tags.map((tag) =>
      getIdOrInsertNewData("tags", ["tag_name"], [tag])
    )
  );

  // delete old tags
  await sqlRun("DELETE FROM word_group_tags WHERE word_group_id = ?", [
    groupId,
  ]);

  // Add the tag IDs to the word_group_tags table to link them to the group ID
  await Promise.all(
    tagIds.map((tagId) =>
      insertData(
        "word_group_tags",
        ["word_group_id", "tag_id"],
        [groupId, tagId]
      )
    )
  );
  return { id: groupId };
};

/**
 * Helper function to query the database and return all rows.
 *
 * @param {string} query - The SQL query to run.
 * @param {any[]} params - The parameters to pass to the query if only specific rows are needed.
 * @returns {Promise<Object[]>} - An array of rows or an empty array if no rows.
 */
const sqlQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

/**
 * Helper function to run a SQL query like insert, update or delete.
 * Returns the last inserted ID.
 * 
 * @param {string} query - The SQL query to run.
 * @param {any[]} params - The parameters to pass to the query.
 * @returns {Promise<number>} - The ID of the last inserted row.
 */
const sqlRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
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
  const query = `DELETE FROM word_groups WHERE id = ? AND user_id = ?`;
  sqlRun(query, [groupId, userId]);
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
  const query = `
    WITH user_groups AS (
    SELECT
      wg.id AS id,
      wg.created_at,
      wg.updated_at,
      w.word,
      l.language_name,
      GROUP_CONCAT(DISTINCT ws.synonym ORDER BY ws.synonym) AS synonyms,
      GROUP_CONCAT(DISTINCT t.tag_name ORDER BY t.tag_name) AS tags,
      DENSE_RANK() OVER (ORDER BY wg.id) AS group_number
      FROM word_groups wg
      JOIN words w ON w.group_id = wg.id
      LEFT JOIN languages l ON l.id = w.language_id
      LEFT JOIN word_synonyms ws ON ws.word_id = w.id
      LEFT JOIN word_group_tags wgt ON wgt.word_group_id = wg.id
      LEFT JOIN tags t ON t.id = wgt.tag_id
    WHERE ${userId ? "wg.user_id = ?" : "wg.user_id IS NULL"}
    GROUP BY w.word, l.language_name, wg.id
    ORDER BY wg.id, l.language_name
    )
    SELECT * FROM user_groups WHERE id = ?`;

  const params = userId ? [userId, groupId] : [groupId];
  const dbResponse = await sqlQuery(query, params);
  if (dbResponse.length === 0) {
    console.error("No word group found with the given ID");
    return null;
  }

  const id = dbResponse[0].id;
  const translations = dbResponse.map((row) => {
    return {
      languageName: row.language_name,
      word: row.word,
      synonyms: row.synonyms ? row.synonyms.split(",") : [],
    };
  });
  const tags = dbResponse[0].tags ? dbResponse[0].tags.split(",") : []; // tags are the same for all rows
  return {
    id,
    translations,
    tags,
    createdAt: dbResponse[0].created_at,
    updatedAt: dbResponse[0].updated_at,
  };
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
export const getMultipleWordGroups = async ({
  offset,
  limit,
  getAll,
  userId,
}) => {
  // AI assistance was needed here because didn't know about dense rank and how to use it.
  // use a cte to filter data based on user_id and then do another select for that cte's result.
  // if no userId null is used to get all data tied to the database itself. Then dense rank allows
  // pagination to work since it starts from 1 and increments by 1 afer the id changes.
  const query = `
    WITH user_groups AS (
    SELECT
      wg.id AS id,
      wg.created_at,
      wg.updated_at,
      w.word,
      l.language_name,
      GROUP_CONCAT(DISTINCT ws.synonym ORDER BY ws.synonym) AS synonyms,
      GROUP_CONCAT(DISTINCT t.tag_name ORDER BY t.tag_name) AS tags,
      DENSE_RANK() OVER (ORDER BY wg.id) AS group_number
    FROM word_groups wg
      JOIN words w ON w.group_id = wg.id
      LEFT JOIN languages l ON l.id = w.language_id
      LEFT JOIN word_synonyms ws ON ws.word_id = w.id
      LEFT JOIN word_group_tags wgt ON wgt.word_group_id = wg.id
      LEFT JOIN tags t ON t.id = wgt.tag_id
    WHERE ${userId ? "wg.user_id = ?" : "wg.user_id IS NULL"}
    GROUP BY w.word, l.language_name, wg.id
    ORDER BY wg.id, l.language_name
    )
    SELECT * FROM user_groups
    ${getAll ? "" : `WHERE group_number > ? AND group_number <= ?`}`;
  const dbResponse = await sqlQuery(
    query,
    userId
      ? getAll
        ? [userId]
        : [userId, offset, offset + limit]
      : getAll
      ? []
      : [offset, offset + limit]
  );
  let isFirstEntryInGroup = true;
  let currentId = dbResponse[0]?.id;
  if (!currentId) {
    return [];
  }
  let wordGroup = [];
  let allGroups = [];

  for (const row of dbResponse) {
    if (row.id !== currentId) {
      currentId = row.id;
      allGroups.push(wordGroup);
      isFirstEntryInGroup = true;
    }
    if (isFirstEntryInGroup) {
      wordGroup = {
        id: row.id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        translations: [],
        tags: row.tags ? row.tags.split(",") : [],
      };
      isFirstEntryInGroup = false;
    }
    wordGroup.translations.push({
      languageName: row.language_name,
      word: row.word,
      synonyms: row.synonyms ? row.synonyms.split(",") : [],
    });
  }
  allGroups.push(wordGroup);
  return allGroups;
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
  const query = `SELECT * FROM users WHERE username = ?`;
  const user = await sqlQuery(query, [username]);
  return user[0];
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
    const id = await insertData(
      "users",
      ["username", "password"],
      [username, password]
    );
    return id;
  } catch (error) {
    return { error: "Internal server error" };
  }
};
