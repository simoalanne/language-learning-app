import sqlite3 from "sqlite3";
const db = new sqlite3.Database(":memory:");
import {
  commonWords,
  verbs,
  adjectives,
  sports,
  animals,
} from "./addStartingTranslations.js";

// Initializes the database by creating following tables:
// - languages: contains language name and id
// - words: contains word, language id and group id it belongs to
// - word_synonyms: contains word id and synonym
// - word_groups: contains metadata, id and user id to tie the word groups to specific user
// - tags: contains tag name and id
// - word_group_tags: many to many table to link word groups and tags together to allow storing multiple tags for a word group
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
    user_id INTEGER REFERENCES users (id),
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
    await Promise.all(
      words.map(
        async (word) =>
          await insertRawSql(
            `INSERT INTO words (language_id, word, group_id) VALUES ${word}`
          )
      )
    );

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
    await Promise.all(
      tags.map(
        async (tag) =>
          await insertRawSql(`INSERT INTO tags (tag_name) VALUES ("${tag}")`)
      )
    );

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
 * Helper function to fetch the next group ID for the new word group.
 *
 * @returns {Promise<number>} - The next group ID. if now rows yet, returns 1.
 */
export const getNextGroupId = () => {
  return new Promise((resolve, reject) => {
    db.get("SELECT MAX(group_id) AS groupId FROM word_groups", (err, row) => {
      if (err) return reject(err);
      resolve((row.groupId || 0) + 1);
    });
  });
};

/**
 * Adds a new word group to the database.
 *
 * @param {Object} wordGroupObj - The word group object to be added.
 * @returns {Promise<Object>} - The group ID of the newly added word group.
 * @example const wordGroupObj = {
 * translations: [
 * [
 * { languageName: "English", word: "Hello", synonyms: ["Hi"] },
 * { languageName: "Finnish", word: "Hei", synonyms: ["Moi"] },
 * {...} // no limit for amount of languages that can be in a word group
 * ],
 * tags: ["greeting", "easy"], // optional, no limit for amount of tags
 */
export const addNewWordGroup = async (wordGroupObj) => {
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

  const query = `SELECT MAX(id) AS id FROM word_groups`;
  const groupId = (await sqlQuery(query))[0]?.id + 1;

  // add words to db and get the word IDs
  const wordIds = await Promise.all(
    wordGroupObj.translations.map(async (translations, index) => {
      return await insertData(
        "words",
        ["language_id", "word", "group_id"],
        [languageIds[index], translations.word, groupId]
      );
    })
  );

  // add synonyms to db for each word using the word IDs
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

  // add the group to the word_groups table
  await insertData(
    "word_groups",
    ["group_name"], // group_name is the first translation word
    [wordGroupObj.translations[0].word]
  );

  // add tags to db that don't exist and get all the tag IDs
  const tagIds = await Promise.all(
    wordGroupObj.tags.map((tag) =>
      getIdOrInsertNewData("tags", ["tag_name"], [tag])
    )
  );

  // add the tag IDs to the word_group_tags table to link them to the group ID
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
 * @param {Object} wordGroupObj - The word group object to be updated.
 * @returns {Promise<number>} - The group ID of the updated word group.
 */
export const updateWordGroup = async (wordGroupObj) => {
  const id = wordGroupObj.id;
  if (
    (await sqlQuery("SELECT id FROM word_groups WHERE id = ?", [id])).length ===
    0
  ) {
    return { error: "No word group found with the given ID" };
  }
  await deleteWordGroupById(id);
  await addNewWordGroup(wordGroupObj);
  return { id };
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

export const getAllWordGroupIds = async () => {
  const groupIds = await sqlQuery("SELECT DISTINCT id FROM word_groups");
  return groupIds.map((row) => row.id);
};
/**
 * Fetches all languages from the database.
 *
 * @returns {Promise<Object[]>} - An array of language objects or an empty array if no languages.
 */

export const getAllLanguages = async () =>
  await sqlQuery("SELECT * FROM languages");
/**
 * Fetches all tags from the database.
 *
 * @returns {Promise<Object[]>} - An array of tag objects or an empty array if no tags.
 */
export const getAllTags = async () => await sqlQuery("SELECT * FROM tags");

export const getAllWords = async () => {
  const query = `SELECT words.id, words.primary_word as word, languages.language_name as languageName
  FROM words JOIN languages ON words.language_id = languages.id`;
  return await sqlQuery(query);
};

export const deleteWordGroupById = async (groupId) => {
  const query = `DELETE FROM word_groups WHERE id = ?`;
  return new Promise((resolve, reject) => {
    db.run(query, [groupId], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

export const deleteAllWordGroups = async () => {
  const queries = [
    `DELETE FROM word_groups`,
    `DELETE FROM words`,
    `DELETE FROM languages`,
    `DELETE FROM word_synonyms`,
    `DELETE FROM tags`,
    `DELETE FROM word_group_tags`,
  ];
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      queries.forEach((query) => {
        db.run(query, (err) => {
          if (err) return reject(err);
        });
      });
      resolve();
    });
  });
};

export const getWordGroupById = async (groupId) => {
  const query = `
    SELECT 
      wg.id AS id,
      wg.created_at,
      wg.updated_at,
      w.word,
      l.language_name,
      GROUP_CONCAT(DISTINCT ws.synonym ORDER BY ws.synonym) AS synonyms,
      GROUP_CONCAT(DISTINCT t.tag_name ORDER BY t.tag_name) AS tags
    FROM word_groups wg
      JOIN words w ON w.group_id = wg.id
      LEFT JOIN languages l ON l.id = w.language_id
      LEFT JOIN word_synonyms ws ON ws.word_id = w.id
      LEFT JOIN word_group_tags wgt ON wgt.word_group_id = wg.id
      LEFT JOIN tags t ON t.id = wgt.tag_id
    WHERE wg.id = ?
    GROUP BY w.word, l.language_name, wg.id`;

  const dbResponse = await sqlQuery(query, [groupId]);
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

export const getMultipleWordGroups = async ({ offset, limit, getAll }) => {
  const query = `
    SELECT 
      wg.id AS id,
      wg.created_at,
      wg.updated_at,
      w.word,
      l.language_name,
      GROUP_CONCAT(DISTINCT ws.synonym ORDER BY ws.synonym) AS synonyms,
      GROUP_CONCAT(DISTINCT t.tag_name ORDER BY t.tag_name) AS tags
    FROM word_groups wg
      JOIN words w ON w.group_id = wg.id
      LEFT JOIN languages l ON l.id = w.language_id
      LEFT JOIN word_synonyms ws ON ws.word_id = w.id
      LEFT JOIN word_group_tags wgt ON wgt.word_group_id = wg.id
      LEFT JOIN tags t ON t.id = wgt.tag_id
    ${getAll ? "" : "WHERE wg.id > ? AND wg.id <= ?"}
    GROUP BY w.word, l.language_name, wg.id
    ORDER BY wg.id, l.language_name`;

  const dbResponse = await sqlQuery(
    query,
    getAll ? [] : [offset, offset + limit]
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

export const getMaxId = async () =>
  (await sqlQuery("SELECT MAX(id) AS id FROM word_groups"))[0]?.id;

const getTotalds = async (tableName) =>
  (await sqlQuery("SELECT COUNT(DISTINCT id) AS total FROM " + tableName))[0]
    .total;

export const getTotalAndPages = async (tableName, limit) => {
  const total = await getTotalds(tableName);
  const pages = Math.floor(total / limit);
  return { total, pages };
};

export const getUserByUsername = async (username) => {
  const query = `SELECT * FROM users WHERE username = ?`;
  const user = await sqlQuery(query, [username]);
  return user[0];
};

export const addUser = async (username, password) => {
  try {
    await insertData("users", ["username", "password"], [username, password]);
  } catch (error) {
    return { error: "Internal server error" };
  }
};
