DROP TABLE IF EXISTS text_entries;
DROP TABLE IF EXISTS translation_groups;
DROP TABLE IF EXISTS topics;
DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS language_enum;
DROP TYPE IF EXISTS group_type_enum;

CREATE TYPE language_enum AS ENUM (
    'English', 'Finnish', 'French', 'German', 'Spanish', 'Swedish'
);

CREATE TYPE group_type_enum AS ENUM (
    'word', 'sentence', 'text'
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(20) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    user_data JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE topics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL DEFAULT 'Untitled Topic',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    modified_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, name)
);

CREATE TABLE translation_groups (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_type group_type_enum NOT NULL, -- 'words', 'sentences', 'long_texts'
    data JSONB DEFAULT '{}'::JSONB, -- group type specific metadata. For example for 'words' what kind of word, for 'sentences' what kind of sentence, etc.
    difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5 OR difficulty_level IS NULL),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE text_entries (
    id SERIAL PRIMARY KEY,
    translation_group_id INTEGER NOT NULL REFERENCES translation_groups(id) ON DELETE CASCADE,
    language language_enum NOT NULL,
    content TEXT NOT NULL
);
