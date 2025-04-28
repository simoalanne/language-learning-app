import { query } from "../config/db.js";
import camelcaseKeys from "camelcase-keys";

export const fetchTranslationGroups = async (userId, topicId, filters = {}) => {
  console.log("Fetching translation groups for userId:", userId, "and topicId:", topicId);
  const [wordGroups, sentenceGroups, longTextGroups] = await Promise.all([
    await query(
      `
      SELECT tg.id AS group_id, tg.difficulty_level AS difficulty, tg.data->>'wordType' AS wordType,
        jsonb_agg(jsonb_build_object(
          'language', w.language,
          'word', w.word,
          'synonyms', w.synonyms
        )) AS entryWords
      FROM translation_groups tg
      LEFT JOIN words w ON tg.id = w.translation_group_id
      WHERE tg.topic_id = $1 AND tg.group_type = 'word' AND
        tg.topic_id in (SELECT id FROM topics WHERE user_id = $2)
      GROUP BY tg.id;
      `,
      [topicId, userId]
    ),
    await query(
      `
      SELECT tg.id AS group_id, tg.data->>'sentenceType' AS sentenceType,
        jsonb_agg(jsonb_build_object(
          'language', s.language,
          'text', s.sentence
        )) AS sentences
      FROM translation_groups tg
      LEFT JOIN sentences s ON tg.id = s.translation_group_id
      WHERE tg.topic_id = $1 AND tg.group_type = 'sentence' AND 
        tg.topic_id in (SELECT id FROM topics WHERE user_id = $2)
      GROUP BY tg.id;
      `,
      [topicId, userId]
    ),
    await query(
      `
      SELECT tg.id AS group_id, tg.data->>'title' AS title, tg.data->>'description' AS description, tg.data->>'tone' AS tone,
        jsonb_agg(jsonb_build_object(
          'language', lt.language,
          'title', lt.title,
          'body', lt.body
        )) AS longTexts
      FROM translation_groups tg
      LEFT JOIN long_texts lt ON tg.id = lt.translation_group_id
      WHERE tg.topic_id = $1 AND tg.group_type = 'long_text' AND
        tg.topic_id in (SELECT id FROM topics WHERE user_id = $2)
      GROUP BY tg.id;
      `,
      [topicId, userId]
    )
  ])
  return camelcaseKeys(
    {
      wordGroups: wordGroups || [],
      sentenceGroups: sentenceGroups || [],
      longTextGroups: longTextGroups || [],
    },
    { deep: true }
  );
};

export const fetchPublicTranslationGroups = async (topicId) => {
  const publicUserId = (await query(
    `SELECT id FROM users WHERE (user_data -> 'isPublic')::boolean = true`,
    [],
    { onlyFirstRow: true }
  ))?.id || 0;
  return await fetchTranslationGroups(publicUserId, topicId);
};


export const createWordGroup = async (userId, topicId, groupData) => {
  console.log("Creating word group for userId:", userId, "and topicId:", topicId);
  console.log("Group data:", JSON.stringify(groupData, null, 2));
  const result = await query(
    `
    WITH topic_validation AS (
        SELECT id FROM topics WHERE id = $1 AND user_id = $2
    ), new_group AS (
        INSERT INTO translation_groups (topic_id, group_type, difficulty_level, data)
        SELECT id, 'word', $3, $4::jsonb
        FROM topic_validation
        RETURNING id
    )
    INSERT INTO words (translation_group_id, language, word, synonyms)
    SELECT id, w.language::language_enum, w.word, w.synonyms
    FROM new_group, jsonb_to_recordset($5) AS w(language TEXT, word TEXT, synonyms TEXT[])
    RETURNING (SELECT id FROM new_group) AS group_id;
    `,
    [
      topicId,
      userId,
      groupData.difficultyLevel,
      JSON.stringify({ wordType: groupData.wordType }),
      JSON.stringify(groupData.words)
    ], { onlyFirstRow: true });
  return result?.group_id || null;
};

export const createSentenceGroup = async (userId, topicId, groupData) => {
  console.log("Creating sentence group for userId:", userId, "and topicId:", topicId);
  console.log("Group data:", JSON.stringify(groupData, null, 2));
  const result = await query(
    `
    WITH topic_validation AS (
        SELECT id FROM topics WHERE id = $1 AND user_id = $2
    ), new_group AS (
        INSERT INTO translation_groups (topic_id, group_type, data)
        SELECT id, 'sentence', $3::jsonb
        FROM topic_validation
        RETURNING id
    )
    INSERT INTO sentences (translation_group_id, language, sentence)
    SELECT new_group.id, s.language::language_enum, s.sentence
    FROM new_group, jsonb_to_recordset($4) AS s(language TEXT, sentence TEXT)
    RETURNING (SELECT id FROM new_group) AS group_id;
    `,
    [
      topicId,
      userId,
      JSON.stringify({ sentenceType: groupData.sentenceType }), // Store `data` as JSON
      JSON.stringify(groupData.sentences) // Ensure proper JSON conversion for sentence entries
    ],
    { onlyFirstRow: true }
  );
  return result?.group_id || null;
};

export const createLongTextGroup = async (userId, topicId, groupData) => {
  console.log("Creating long text group for userId:", userId, "and topicId:", topicId);
  console.log("Group data:", JSON.stringify(groupData, null, 2));
  const result = await query(
    `
    WITH topic_validation AS (
        SELECT id FROM topics WHERE id = $1 AND user_id = $2
    ), new_group AS (
        INSERT INTO translation_groups (topic_id, group_type, data)
        SELECT id, 'long_text', $3::jsonb
        FROM topic_validation
        RETURNING id
    )
    INSERT INTO long_texts (translation_group_id, user_id, language, title, body)
    SELECT new_group.id, $2, l.language::language_enum, l.title, l.body
    FROM new_group, jsonb_to_recordset($4) AS l(language TEXT, title TEXT, body TEXT)
    RETURNING (SELECT id FROM new_group) AS group_id;
    `,
    [
      topicId,
      userId,
      JSON.stringify({
        title: groupData.title,
        description: groupData.description,
        tone: groupData.tone,
      }), // Stores metadata as JSONB in `data`
      JSON.stringify(groupData.longTexts) // Batch insert individual texts
    ],
    { onlyFirstRow: true }
  );
  return result?.group_id || null;
};

export const updateWordGroup = async (userId, topicId, groupId, groupData) => {
  console.log("Updating word group for userId:", userId, "and topicId:", topicId, "and groupId:", groupId);
  console.log("Group data:", JSON.stringify(groupData, null, 2));
  const result = await query(
    `
    WITH topic_validation AS (
        SELECT id FROM topics WHERE id = $1 AND user_id = $2
    ), deleted_words AS (
        DELETE FROM words WHERE translation_group_id = $3
        RETURNING translation_group_id
    ), updated_group AS (
        UPDATE translation_groups 
        SET difficulty_level = $4, data = $5::jsonb
        WHERE id = $3 AND topic_id = $1
        RETURNING id
    )
    INSERT INTO words (translation_group_id, language, word, synonyms)
    SELECT updated_group.id, w.language::language_enum, w.word, w.synonyms
    FROM updated_group, jsonb_to_recordset($6) AS w(language TEXT, word TEXT, synonyms TEXT[])
    RETURNING (SELECT id FROM updated_group) AS group_id;
    `,
    [
      topicId,
      userId,
      groupId,
      groupData.difficultyLevel,
      JSON.stringify({ wordType: groupData.wordType }),
      JSON.stringify(groupData.words)
    ], { onlyFirstRow: true }
  );
  return result?.group_id || null;
};

export const updateSentenceGroup = async (userId, topicId, groupId, groupData) => {
  console.log("Updating sentence group for userId:", userId, "and topicId:", topicId, "and groupId:", groupId);
  console.log("Group data:", JSON.stringify(groupData, null, 2));
  const result = await query(
    `
    WITH topic_validation AS (
        SELECT id FROM topics WHERE id = $1 AND user_id = $2
    ), deleted_sentences AS (
        DELETE FROM sentences WHERE translation_group_id = $3 RETURNING translation_group_id
    ), updated_group AS (
        UPDATE translation_groups 
        SET data = $4::jsonb
        WHERE id = $3 AND topic_id = $1
        RETURNING id
    )
    INSERT INTO sentences (translation_group_id, language, sentence)
    SELECT updated_group.id, s.language::language_enum, s.sentence
    FROM updated_group, jsonb_to_recordset($5) AS s(language TEXT, sentence TEXT)
    RETURNING (SELECT id FROM updated_group) AS group_id;
    `,
    [
      topicId,
      userId,
      groupId,
      JSON.stringify({ sentenceType: groupData.sentenceType }), // Updated metadata
      JSON.stringify(groupData.sentences) // New entries
    ], 
    { onlyFirstRow: true }
  );
  return result?.group_id || null;
};

export const updateLongTextGroup = async (userId, topicId, groupId, groupData) => {
  console.log("Updating long text group for userId:", userId, "and topicId:", topicId, "and groupId:", groupId);
  const result = await query(
    `
    WITH topic_validation AS (
        SELECT id FROM topics WHERE id = $1 AND user_id = $2
    ), deleted_long_texts AS (
        DELETE FROM long_texts WHERE translation_group_id = $3 RETURNING translation_group_id
    ), updated_group AS (
        UPDATE translation_groups 
        SET data = $4::jsonb
        WHERE id = $3 AND topic_id = $1
        RETURNING id
    )
    INSERT INTO long_texts (translation_group_id, user_id, language, title, body)
    SELECT updated_group.id, $2, l.language::language_enum, l.title, l.body
    FROM updated_group, jsonb_to_recordset($5) AS l(language TEXT, title TEXT, body TEXT)
    RETURNING (SELECT id FROM updated_group) AS group_id;
    `,
    [
      topicId,
      userId,
      groupId,
      JSON.stringify({
        title: groupData.title,
        description: groupData.description,
        tone: groupData.tone,
      }), // Updated metadata
      JSON.stringify(groupData.longTexts) // New entries
    ], 
    { onlyFirstRow: true }
  );
  return result?.group_id || null;
};

export const deleteTranslationGroups = async (userId, topicId, groupIds) => {
  console.log("Deleting translation groups for userId:", userId, "and topicId:", topicId, "and groupIds:", groupIds);
  return await query(
    `
    DELETE FROM translation_groups
    WHERE id = ANY($1::int[])
    AND topic_id = $2
    AND topic_id IN (SELECT id FROM topics WHERE user_id = $3)
    `,
    [groupIds, topicId, userId]
  );
};
