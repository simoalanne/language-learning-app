import { json } from "express";
import sqlite3 from "sqlite3";

const db = new sqlite3.Database(":memory:");

/**
 * Initializes the database by creating following tables:
 * - languages: Stores language name and its id.
 * - words: Stores the primary word and its language id.
 * - word_synonyms: Stores synonyms for the primary word.
 * - word_groups: Links the word in all languages to a single group.
 * - difficulty_levels: Stores difficulty levels for words.
 * - word_group_difficulty: Links word groups to difficulty levels.
 * - tags: Stores tags related to a certain word group.
 * - word_group_tags: Links word groups to tags.
 */
export const initDb = () => {
  db.serialize(() => {
    const createTableQueries = [
      `CREATE TABLE languages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        language_name TEXT NOT NULL
      )`,
      `CREATE TABLE words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        language_id INTEGER REFERENCES languages (id),
        primary_word TEXT NOT NULL
      )`,
      `CREATE TABLE word_synonyms (
        word_id INTEGER REFERENCES words (id),
        word TEXT NOT NULL,
        PRIMARY KEY (word_id, word)
      )`,
      `CREATE TABLE word_groups (
        group_id INTEGER,
        word_id INTEGER REFERENCES words (id),
        PRIMARY KEY (group_id, word_id)
      )`,
      `CREATE TABLE difficulty_levels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        difficulty_value INTEGER NOT NULL
      )`,
      `CREATE TABLE word_group_difficulty (
        word_group_id INTEGER REFERENCES word_groups (group_id),
        difficulty_id INTEGER REFERENCES difficulty_levels (id),
        PRIMARY KEY (word_group_id, difficulty_id)
      )`,
      `CREATE TABLE tags (
        id INTEGER PRIMARY KEY,
        tag_name TEXT NOT NULL
      )`,
      `CREATE TABLE word_group_tags (
        word_group_id INTEGER REFERENCES word_groups (group_id),
        tag_id INTEGER REFERENCES tags (id),
        PRIMARY KEY (word_group_id, tag_id)
      )`,
    ];

    createTableQueries.forEach((query) => db.run(query));
    console.info("Database initialized");
  });
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
 * This is used when adding new languages, tags, difficulty etc and the id of the data is needed in other queries.
 *
 * @param {string} table - The table name.
 * @param {string} column - The column name.
 * @param {string} value - The value to insert.
 * @returns {Promise<number>} - The ID of the row.
 * @example getIdOrInsertNewData("languages", "language_name", "English");
 */
const getIdOrInsertNewData = (table, column, value) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.get(
        `SELECT id FROM ${table} WHERE ${column} = ?`,
        [value],
        (err, row) => {
          if (err) return reject(err);
          if (row) return resolve(row.id);
          db.run(
            `INSERT INTO ${table} (${column}) VALUES (?)`,
            [value],
            function (err) {
              // Can't use arrow function because this will be undefined otherwise
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
const getNextGroupId = () => {
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
 * languages:
 * [
 * { languageName: "English", word: "Hello", synonyms: ["Hi"] },
 * { languageName: "Finnish", word: "Hei", synonyms: ["Moi"] },
 * {...} // no limit for amount of languages that can be in a word group
 * ],
 * tags: ["greeting", "easy"], // optional, no limit for amount of tags
 * difficulty: 1 // optional, difficulty level of the word group
 */
export const addNewWordGroup = async (wordGroupObj) => {
  const groupId = await getNextGroupId(); // get the group ID to use for the new word group

  // Add languages to db that don't exist and get all the language IDs
  const languageIds = await Promise.all(
    wordGroupObj.languages.map((languageObj) =>
      getIdOrInsertNewData(
        "languages",
        "language_name",
        languageObj.languageName
      )
    )
  );

  // add words to db and get the word IDs
  const wordIds = await Promise.all(
    wordGroupObj.languages.map(async (languageObj, index) => {
      return await insertData(
        "words",
        ["language_id", "primary_word"],
        [languageIds[index], languageObj.word]
      );
    })
  );

  // add synonyms to db for each word using the word IDs
  await Promise.all(
    wordGroupObj.languages.map(async (languageObj, index) => {
      await Promise.all(
        languageObj.synonyms.map(async (synonym) => {
          await insertData(
            "word_synonyms",
            ["word_id", "word"],
            [wordIds[index], synonym]
          );
        })
      );
    })
  );

  // add the word IDs to the word_groups table to link them to the group ID
  await Promise.all(
    wordIds.map((wordId) =>
      insertData("word_groups", ["group_id", "word_id"], [groupId, wordId])
    )
  );

  // add tags to db that don't exist and get all the tag IDs
  const tagIds = await Promise.all(
    wordGroupObj.tags.map((tag) =>
      getIdOrInsertNewData("tags", "tag_name", tag)
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

  // add the difficulty level to db if it doesn't exist and get the difficulty ID
  const difficultyId = await getIdOrInsertNewData(
    "difficulty_levels",
    "difficulty_value",
    wordGroupObj.difficulty
  );

  // add the difficulty ID to the word_group_difficulty table to link it to the group ID
  await insertData(
    "word_group_difficulty",
    ["word_group_id", "difficulty_id"],
    [groupId, difficultyId]
  );

  // finally return the group ID of the newly added word group.
  return { groupId };
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

/**
 * Fetches all difficulty levels from the database.
 *
 * @returns {Promise<Object[]>} - An array of difficulties or an empty array if no difficulties.
 */
export const getAllDifficultyLevels = async () =>
  await sqlQuery("SELECT * FROM difficulty_levels");

export const getWordGroupById = async (groupId) => {
  const query = `
    SELECT
        words.id AS word_id,
        words.primary_word,
        languages.language_name,
        GROUP_CONCAT(DISTINCT word_synonyms.word ORDER BY word_synonyms.word ASC) AS synonyms,
        difficulty_levels.difficulty_value AS difficulty,
        GROUP_CONCAT(DISTINCT tags.tag_name ORDER BY tags.tag_name ASC) AS tags
    FROM
        words
    JOIN
        languages ON words.language_id = languages.id
    LEFT JOIN
        word_synonyms ON words.id = word_synonyms.word_id
    JOIN
        word_groups ON words.id = word_groups.word_id
    LEFT JOIN
        word_group_difficulty ON word_groups.group_id = word_group_difficulty.word_group_id
    LEFT JOIN
        difficulty_levels ON word_group_difficulty.difficulty_id = difficulty_levels.id
    LEFT JOIN
        word_group_tags ON word_groups.group_id = word_group_tags.word_group_id
    LEFT JOIN
        tags ON word_group_tags.tag_id = tags.id
    WHERE
        word_groups.group_id = ?
    GROUP BY
        words.id, words.primary_word, languages.language_name, difficulty_levels.difficulty_value;
  `;
  const dbResponse = await sqlQuery(query, [groupId]);
  const languages = dbResponse.map((row) => {
    return {
      languageName: row.language_name,
      word: row.primary_word,
      synonyms: row.synonyms ? row.synonyms.split(",") : [],
    };
  });
  const tags = dbResponse[0].tags ? dbResponse[0].tags.split(",") : []; // tags are the same for all rows
  const difficulty = dbResponse[0].difficulty; // difficulty is the same for all rows
  return { languages, tags, difficulty };
};
