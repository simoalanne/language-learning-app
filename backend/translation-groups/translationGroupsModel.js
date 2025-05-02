import { query, querySingleRow } from "../config/db.js";
import camelcaseKeys from "camelcase-keys";

export const fetchTranslationGroups = async (userId, topicId, groupType, minDifficultyLevel) => {
  const conditions = [];
  const params = [];

  // Public or private
  if (userId) {
    params.push(userId);
    conditions.push(`tg.user_id = $${params.length}`);
  } else {
    conditions.push(`t.is_public = TRUE`);
  }

  // Optional filters
  if (topicId) {
    params.push(topicId);
    conditions.push(`tg.topic_id = $${params.length}`);
  }

  if (groupType) {
    params.push(groupType);
    conditions.push(`tg.group_type = $${params.length}`);
  }

  if (minDifficultyLevel !== undefined && minDifficultyLevel !== null) {
    params.push(minDifficultyLevel);
    conditions.push(`tg.difficulty_level >= $${params.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const queryStr = `
    SELECT 
      tg.id AS group_id,
      tg.topic_id,
      tg.group_type,
      tg.difficulty_level,
      tg.data,
      tg.created_at,
      tg.updated_at,
      COALESCE(
        json_agg(
          jsonb_build_object(
            'language', te.language,
            'content', te.content
          )
        ) FILTER (WHERE te.id IS NOT NULL), '[]'
      ) AS text_entries
    FROM translation_groups tg
    LEFT JOIN text_entries te ON tg.id = te.translation_group_id
    LEFT JOIN topics t ON tg.topic_id = t.id
    ${whereClause}
    GROUP BY tg.id
    ORDER BY tg.created_at DESC;
  `;

  const groups = await query(queryStr, params);
  return camelcaseKeys(groups, { deep: true });
};


export const createTranslationGroups = async (userId, topicId, groupsData) => {
  // Extract and format group data
  const formattedGroupsData = JSON.stringify(
    groupsData.map(({ groupType, difficultyLevel, meta }) => ({
      group_type: groupType,
      difficulty_level: difficultyLevel,
      meta,
    }))
  );

  // Extract and format entries data
  const formattedEntriesData = JSON.stringify(
    groupsData.flatMap(g =>
      g.entries.map(e => ({ ...e, group_type: g.groupType }))
    )
  );

  const result = await querySingleRow(
    `
    WITH new_groups AS (
        INSERT INTO translation_groups (topic_id, user_id, group_type, difficulty_level, data)
        SELECT $1, $2, g.group_type::group_type_enum, g.difficulty_level, g.meta::jsonb
        FROM jsonb_to_recordset($3) AS g(group_type TEXT, difficulty_level INTEGER, meta JSONB)
        RETURNING id, group_type
    )
    INSERT INTO text_entries (translation_group_id, language, content)
    SELECT ng.id, t.language::language_enum, t.content
    FROM new_groups ng
    JOIN jsonb_to_recordset($4) AS t(group_type TEXT, language TEXT, content TEXT)
    ON ng.group_type = t.group_type::group_type_enum
    RETURNING (SELECT jsonb_agg(id) FROM new_groups) AS group_ids;
    `,
    [topicId, userId, formattedGroupsData, formattedEntriesData],
    { onlyFirstRow: true }
  );

  return camelcaseKeys(result?.group_ids, { deep: true });
};





export const updateTranslationGroup = async (userId, topicId, groupData) => {
  const result = await querySingleRow(
    `
    WITH deleted_entries AS (
        DELETE FROM text_entries WHERE translation_group_id = $3
        RETURNING translation_group_id
    ), updated_group AS (
        UPDATE translation_groups 
        SET difficulty_level = $4, data = $5::jsonb
        WHERE id = $3 AND topic_id = $1 and user_id = $2
        RETURNING id
    )
    INSERT INTO text_entries (translation_group_id, language, content)
    SELECT updated_group.id, t.language::language_enum, t.content
    FROM updated_group, jsonb_to_recordset($6) AS t(language TEXT, content TEXT)
    RETURNING (SELECT id FROM updated_group) AS group_id;
    `,
    [
      topicId,
      userId,
      groupData.groupId,
      groupData.difficultyLevel || null,
      JSON.stringify(groupData.meta || {}),
      JSON.stringify(groupData.entries)
    ],
  );

  const success = !!result?.group_id;
  return success;
};

export const deleteTranslationGroups = async (userId, topicId, groupIds) => {
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
