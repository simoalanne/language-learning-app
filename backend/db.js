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
    const tables = [
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
    tables.forEach((table) => db.run(table));
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

const getIdOrInsertNewData = (table, column, value) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.get(
        `SELECT id, ${column} FROM ${table} WHERE ${column} = ?`,
        [value],
        (err, row) => {
          if (err) return reject(err);
          if (row) {
            return resolve({ id: row.id });
          }
          db.run(
            `INSERT INTO ${table} (${column}) VALUES (?)`,
            [value],
            function (err) {
              if (err) return reject(err);
              resolve({ id: this.lastID });
            }
          );
        }
      );
    });
  });
};


const insertData = (table, columns, values) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${values
        .map(() => "?")
        .join(", ")})`,
      values,
      function (err) {
        if (err) return reject(err);
        resolve(this.lastID);
      }
    );
  });
};

const getGroupId = async () => {
  return new Promise((resolve, reject) => {
    db.get("SELECT MAX(group_id) as id FROM word_groups", (err, row) => {
      if (err) return reject(err);
      resolve(row.id || 0); 
    });
  });
}

export const addNewWordGroup = async (wordGroupObj) => {
  const languageObjects = await Promise.all(
    wordGroupObj.languages.map(async (languageObj) => {
      const languageId = await getIdOrInsertNewData(
        "languages",
        "language_name",
        languageObj.languageName
      );
      return {
        ...languageId,
        ...languageObj,
      };
    })
  );
  
  const tags = await Promise.all(
    wordGroupObj.tags.map(async (tag) => {
      const tagId = await getIdOrInsertNewData("tags", "tag_name", tag);
      return tagId;
    })
  );

  const difficulty = await getIdOrInsertNewData(
    "difficulty_levels",
    "difficulty_value",
    wordGroupObj.difficulty
  );

  const words = await Promise.all(
    languageObjects.map(async (languageObj) => {
      const wordId = await insertData(
        "words",
        ["language_id", "primary_word"],
        [languageObj.id, languageObj.word]
      );
      return {
        ...languageObj,
        wordId,
      };
    })
  );

await Promise.all(
  words.map(async (wordObj) => {
    await Promise.all(
      wordObj.synonyms.map(async (synonym) => {
        await insertData(
          "word_synonyms",
          ["word_id", "word"],
          [wordObj.wordId, synonym]
        );
      })
    );
  })
);

  const currentGroupId = await getGroupId() + 1;

  await Promise.all(
    words.map(async (wordObj) => {
      await insertData("word_groups", ["group_id", "word_id"], [
        currentGroupId,
        wordObj.wordId,
      ]);
    })
  );

  await Promise.all(
    tags.map(async (tag) => {
      await insertData("word_group_tags", ["word_group_id", "tag_id"], [
        currentGroupId,
        tag.id,
      ]);
    })
  );

  await insertData("word_group_difficulty", ["word_group_id", "difficulty_id"], [
    currentGroupId,
    difficulty.id,
  ]);
};

