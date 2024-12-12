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
        word TEXT,
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
    console.info("Database initialized")
  });
};

export const closeDb = () => {
  db.close(err => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.info("Database closed");
  });
};

