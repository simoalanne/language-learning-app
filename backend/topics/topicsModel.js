import camelcaseKeys from 'camelcase-keys';
import { query, querySingleRow } from "../config/db.js";

export const fetchTopics = async (userId) => {
  const whereCondition = userId ? { text: 'WHERE t.user_id = $1', params: [userId] } : { text: 'WHERE t.is_public = TRUE', params: [] };
  const topics = await query(`
    SELECT
      t.id AS id,
      t.name AS name,
      t.is_public AS is_public,
      t.created_at AS created_at,
      t.modified_at AS modified_at,
      -- Count translation groups by type
      (SELECT COUNT(*) FROM translation_groups tg WHERE tg.topic_id = t.id AND tg.group_type = 'word') AS word_groups_count,
      (SELECT COUNT(*) FROM translation_groups tg WHERE tg.topic_id = t.id AND tg.group_type = 'sentence') AS sentence_groups_count,
      (SELECT COUNT(*) FROM translation_groups tg WHERE tg.topic_id = t.id AND tg.group_type = 'text') AS long_text_groups_count,
      -- Aggregate distinct languages used within the topic
      COALESCE(
        (SELECT json_agg(DISTINCT te.language) FILTER (WHERE te.language IS NOT NULL)
         FROM text_entries te
         JOIN translation_groups tg ON tg.id = te.translation_group_id
         WHERE tg.topic_id = t.id),
        '[]'
      ) AS languages
    FROM topics t
    ${whereCondition.text}
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `, whereCondition.params);
  return camelcaseKeys(topics, { deep: true });
};

export const createTopic = async (userId, topicName, isPublic) => {
  const result = await querySingleRow(`INSERT INTO topics (user_id, name, is_public) VALUES ($1, $2, $3) RETURNING id`,
    [userId, topicName, isPublic]);
  return result?.id;
};

export const updateTopic = async (userId, topicId, topicName, isPublic) => {
  await query(`UPDATE topics SET name = $1, is_public = $2, WHERE user_id = $3 AND id = $4`,
    [topicName, isPublic, userId, topicId]);
};

export const deleteMultipleTopics = async (userId, topicIds) => {
  await query(`DELETE FROM topics WHERE user_id = $1 AND id = ANY($2::int[])`, [userId, topicIds]);
};
