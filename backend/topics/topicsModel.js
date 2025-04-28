import camelcaseKeys from 'camelcase-keys';
import { query } from "../config/db.js";

export const fetchUserTopics = async (userId) => {
  const topics = await query(`
    SELECT
      t.id AS id,
      t.name AS name,
      t.description AS description,
      t.created_at AS created_at,
      t.modified_at AS modified_at,
      -- Count groups by type
      (SELECT COUNT(*) FROM translation_groups tg WHERE tg.topic_id = t.id AND tg.group_type = 'word') AS word_groups_count,
      (SELECT COUNT(*) FROM translation_groups tg WHERE tg.topic_id = t.id AND tg.group_type = 'sentence') AS sentence_groups_count,
      (SELECT COUNT(*) FROM translation_groups tg WHERE tg.topic_id = t.id AND tg.group_type = 'long_text') AS long_text_groups_count,
      -- Ensure languages always return an empty array if no values exist
      COALESCE(
        (SELECT json_agg(DISTINCT w.language) FILTER (WHERE w.language IS NOT NULL)
         FROM words w
         JOIN translation_groups tg ON tg.id = w.translation_group_id
         WHERE tg.topic_id = t.id),
        '[]'
      ) AS languages,
      COALESCE(json_agg(tg.tag_name) FILTER (WHERE tg.tag_name IS NOT NULL), '[]') AS tags
    FROM topics t
    LEFT JOIN topic_tags tt ON tt.topic_id = t.id
    LEFT JOIN tags tg ON tg.id = tt.tag_id
    WHERE t.user_id = $1
    GROUP BY t.id
    ORDER BY t.modified_at DESC
  `, [userId]);

  return camelcaseKeys(topics, { deep: true });
};




export const fetchPublicTopics = async () => {
  const publicUserId = (await query(
    `SELECT id FROM users WHERE (user_data -> 'isPublic')::boolean = true`,
    [],
    { onlyFirstRow: true }
  ))?.id || 0;
  return await fetchUserTopics(publicUserId);
};

export const createTopic = async (userId, topicData) => {
  const { name, description, tags } = topicData;

  const id = await query(
    `
    WITH inserted_topic AS (
      INSERT INTO topics (user_id, name, description)
      VALUES ($1, $2, $3)
      RETURNING id
    ),
    inserted_tags AS (
      INSERT INTO tags (tag_name, user_id)
      SELECT unnest($4::text[]) AS tag_name, $1
      ON CONFLICT (tag_name, user_id) DO UPDATE SET tag_name = EXCLUDED.tag_name
      RETURNING id
    ),
    inserted_topic_tags AS (
      INSERT INTO topic_tags (topic_id, tag_id)
      SELECT inserted_topic.id, inserted_tags.id
      FROM inserted_topic, inserted_tags
    )
    SELECT inserted_topic.id AS id
    FROM inserted_topic;
    `,
    [userId, name, description, tags],
    { onlyFirstRow: true }
  );

  return id;
};

export const updateTopic = async (userId, topicData) => {
  const { name, description, topicId, tags } = topicData;
  await query(
    // STEP 1: Update the topic itself
    // STEP 2: Unlink all existing tags from the topic
    // STEP 3: Insert all new tags and get back all tag IDs (new or existing)
    // STEP 4: Link the topic with the new tags or existing tags
    // STEP 5: Delete any tags that are no longer linked to any topic
    `WITH updated_topic AS (
        UPDATE topics
        SET name = $1, description = $2, modified_at = NOW()
        WHERE id = $3 AND user_id = $4
    ),
    deleted_tags AS (
        DELETE FROM topic_tags
        WHERE topic_id = $3
    ),
    inserted_tags AS (
        INSERT INTO tags (tag_name, user_id)
        SELECT unnest($5::text[]) AS tag_name, $4
        ON CONFLICT (tag_name, user_id) DO UPDATE SET tag_name = EXCLUDED.tag_name -- This no-op is required to force return of the tag ID
        RETURNING id
    ),
    relinked_tags AS (
        INSERT INTO topic_tags (topic_id, tag_id)
        SELECT $3, id FROM inserted_tags
    )
    SELECT 1 -- no need to return anything but the cte must be terminated
    `,
    [name, description, topicId, userId, tags]
  );
};

export const deleteTopic = async (userId, topicId) => {
  await query(`
      WITH deleted_topic AS (
          DELETE FROM topics
          WHERE id = $1 AND user_id = $2
          RETURNING id
      ),
      unused_tags AS (
        DELETE FROM tags
        WHERE id NOT IN (SELECT DISTINCT tag_id FROM topic_tags)
        AND user_id = $2
      )
      SELECT 1
  `, [topicId, userId]);
};


export const deleteAllTopics = async (userId) => {
  await query(`DELETE FROM topics WHERE user_id = $1`, [userId]);
};
