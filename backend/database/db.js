import sqlite3 from "sqlite3";
const db = new sqlite3.Database(":memory:");

/**
 * Initializes the database by creating following tables:
 * - languages: Stores language name and its id.
 * - words: Stores the primary word and its language id.
 * - word_synonyms: Stores synonyms for the primary word.
 * - word_groups: Links the word in all languages to a single group.
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
        word_id INTEGER REFERENCES words (id) ON DELETE CASCADE,
        word TEXT NOT NULL,
        PRIMARY KEY (word_id, word)
      )`,
      `CREATE TABLE word_groups (
        group_id INTEGER,
        word_id INTEGER REFERENCES words (id) ON DELETE CASCADE,
        PRIMARY KEY (group_id, word_id)
      )`,
      `CREATE TABLE tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tag_name TEXT NOT NULL
      )`,
      `CREATE TABLE word_group_tags (
        word_group_id INTEGER REFERENCES word_groups (group_id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES tags (id),
        PRIMARY KEY (word_group_id, tag_id)
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

    createTableQueries.forEach((query) => db.run(query));
    insertDataQueries.forEach((query) => db.run(query));
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
 * translations: [
 * [
 * { languageName: "English", word: "Hello", synonyms: ["Hi"] },
 * { languageName: "Finnish", word: "Hei", synonyms: ["Moi"] },
 * {...} // no limit for amount of languages that can be in a word group
 * ],
 * tags: ["greeting", "easy"], // optional, no limit for amount of tags
 */
export const addNewWordGroup = async (wordGroupObj) => {
  const groupId = await getNextGroupId(); // get the group ID to use for the new word group

  // Add languages to db that don't exist and get all the language IDs
  const languageIds = await Promise.all(
    wordGroupObj.translations.map((translations) =>
      getIdOrInsertNewData(
      "languages",
        ["language_name"],
        [translations.languageName]
      )
    )
  );

  // add words to db and get the word IDs
  const wordIds = await Promise.all(
    wordGroupObj.translations.map(async (translations, index) => {
      // same word can be stored multiple times even for the same language.
      // this is because its possible to have multiple words with the same spelling but different meanings.
      // also if words with multiple meanings would be stored only once, then keeping track of synonyms would not be possible.
      return await insertData(
        "words",
        ["language_id", "primary_word"],
        [languageIds[index], translations.word]
      );
    })
  );

  // add synonyms to db for each word using the word IDs
  await Promise.all(
    wordGroupObj.translations.map(async (translations, index) => {
      await Promise.all(
        translations.synonyms.map(async (synonym) => {
          await getIdOrInsertNewData(
            "word_synonyms",
            ["word_id", "word"],
            [wordIds[index], synonym],
            "1" // only need to see wheter synonym exists so select "1" to make the query faster
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

export const getAllWordGroupIds = async () => {
  const groupIds = await sqlQuery("SELECT DISTINCT group_id FROM word_groups");
  return groupIds.map((row) => row.group_id);
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
  const query = `DELETE FROM word_groups WHERE group_id = ?`;
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
        word_groups.group_id,
        words.id AS word_id,
        words.primary_word,
        languages.language_name,
        GROUP_CONCAT(DISTINCT word_synonyms.word ORDER BY word_synonyms.word ASC) AS synonyms,
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
        word_group_tags ON word_groups.group_id = word_group_tags.word_group_id
    LEFT JOIN
        tags ON word_group_tags.tag_id = tags.id
    WHERE
        word_groups.group_id = ?
    GROUP BY
        words.id, words.primary_word, languages.language_name;
  `;
  const dbResponse = await sqlQuery(query, [groupId]);
  if (dbResponse.length === 0) {
    console.error("No word group found with the given ID");
    return null;
  }
  const id = dbResponse[0].group_id;
  const translations = dbResponse.map((row) => {
    return {
      languageName: row.language_name,
      word: row.primary_word,
      synonyms: row.synonyms ? row.synonyms.split(",") : [],
    };
  });
  const tags = dbResponse[0].tags ? dbResponse[0].tags.split(",") : []; // tags are the same for all rows
  return { id, translations, tags };
};
