DROP TABLE IF EXISTS topic_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS words;
DROP TABLE IF EXISTS long_texts;
DROP TABLE IF EXISTS sentences;
DROP TABLE IF EXISTS translation_groups;
DROP TABLE IF EXISTS topics;
DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS language_enum;
DROP TYPE IF EXISTS group_type_enum;

CREATE TYPE language_enum AS ENUM (
    'English', 'Finnish', 'French', 'German', 'Spanish', 'Swedish'
);

CREATE TYPE group_type_enum AS ENUM (
    'word', 'sentence', 'long_text'
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

CREATE TABLE translation_groups (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    group_type group_type_enum NOT NULL,
    difficulty_level INTEGER NOT NULL DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    data JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE words (
    id SERIAL PRIMARY KEY,
    translation_group_id INTEGER NOT NULL REFERENCES translation_groups(id) ON DELETE CASCADE,
    language language_enum NOT NULL,
    word VARCHAR(50) NOT NULL,
    synonyms VARCHAR(50)[],
    CHECK (synonyms IS NULL OR array_length(synonyms, 1) <= 2 AND NOT word = ANY(synonyms))
);

CREATE TABLE sentences (
    id SERIAL PRIMARY KEY,
    translation_group_id INTEGER NOT NULL REFERENCES translation_groups(id) ON DELETE CASCADE,
    sentence VARCHAR(150) NOT NULL,
    language language_enum NOT NULL
);

CREATE TABLE long_texts (
    id SERIAL PRIMARY KEY,
    translation_group_id INTEGER NOT NULL REFERENCES translation_groups(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language language_enum NOT NULL,
    title VARCHAR(75) NOT NULL DEFAULT 'Untitled Text',
    body TEXT NOT NULL
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    tag_name VARCHAR(50) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (tag_name, user_id)
);

CREATE TABLE topic_tags (
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE
    PRIMARY KEY (topic_id, tag_id)
);
