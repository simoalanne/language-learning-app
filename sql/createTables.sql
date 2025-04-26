DROP TABLE IF EXISTS topic_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS words;
DROP TABLE IF EXISTS word_groups;
DROP TABLE IF EXISTS long_texts;
DROP TABLE IF EXISTS long_text_groups;
DROP TABLE IF EXISTS sentences;
DROP TABLE IF EXISTS sentence_groups;
DROP TABLE IF EXISTS topics;
DROP TABLE IF EXISTS users;

-- DROP ENUMS
DROP TYPE IF EXISTS language_enum;
DROP TYPE IF EXISTS word_type_enum;
DROP TYPE IF EXISTS sentence_type_enum;
DROP TYPE IF EXISTS long_text_tone_enum;

-- ENUM TYPES (unchanged)
CREATE TYPE language_enum AS ENUM (
    'English','Finnish','French','German','Spanish','Swedish'
);
CREATE TYPE word_type_enum AS ENUM (
    'noun','verb','adjective','other'
);
CREATE TYPE sentence_type_enum AS ENUM (
    'statement','question','exclamation'
);

CREATE TYPE long_text_tone_enum AS ENUM (
    'serious',
    'playful'
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    user_data JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE topics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(75) NOT NULL DEFAULT 'Untitled Topic',
    description VARCHAR(200) NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    modified_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, name)
);

CREATE TABLE word_groups (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    word_type word_type_enum NOT NULL DEFAULT 'other',
    difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE words (
    id SERIAL PRIMARY KEY,
    language language_enum NOT NULL,
    word VARCHAR(50) NOT NULL,
    synonyms VARCHAR(50)[],
    CHECK (synonyms IS NULL OR array_length(synonyms, 1) <= 2 AND NOT word = ANY(synonyms)),
    group_id INTEGER REFERENCES word_groups(id) ON DELETE CASCADE
);

CREATE TABLE sentence_groups (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),
    sentence_type sentence_type_enum NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sentences (
    id SERIAL PRIMARY KEY,
    sentence VARCHAR(150) NOT NULL,
    language language_enum NOT NULL,
    sentence_group_id INTEGER NOT NULL REFERENCES sentence_groups(id) ON DELETE CASCADE
);

CREATE TABLE long_text_groups (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),
    tone long_text_tone_enum NOT NULL DEFAULT 'serious',
    description VARCHAR(150) NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE long_texts (
    id SERIAL PRIMARY KEY,
    long_text_group_id INTEGER NOT NULL REFERENCES long_text_groups(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language language_enum NOT NULL,
    title VARCHAR(75) NOT NULL DEFAULT 'Untitled Text',
    body TEXT NOT NULL,
    UNIQUE (long_text_group_id, language)
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    tag_name VARCHAR(50) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (tag_name, user_id)
);
CREATE TABLE topic_tags (
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (topic_id, tag_id)
);
