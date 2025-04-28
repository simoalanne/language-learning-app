import { query } from "../config/db.js";
import camelcaseKeys from "camelcase-keys";

/**
 * Fetches all tags and the topic names they are used in for a specific user.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Object[]>} - Returns an array of tag objects with their names and the topics they are used in.
 */
export const getUserTags = async (userId) => {
  const result = await query(
    `SELECT 
      t.id AS id,
      t.tag_name AS tag_name,
      COALESCE(
        (SELECT json_agg(tp.name) 
         FROM topics tp
         JOIN topic_tags tt ON tt.topic_id = tp.id
         WHERE tt.tag_id = t.id),
        '[]'
      ) AS used_in_topics
    FROM tags t
    WHERE t.user_id = $1`,
    [userId]
  );
  return camelcaseKeys(result, { deep: true });
};

/**
 * Centralized query that handles updating, inserting, and deleting tags for a user in database in one go.
 * @param {number} userId - The ID of the user.
 * @param {Object} tagsData - The tags data containing added, deleted, and edited tags.
 * @param {string[]} tagsData.added - Array of tag names to be added.
 * @param {number[]} tagsData.deleted - Array of tag IDs to be deleted.
 * @param {Object[]} tagsData.edited - Array of objects containing tag IDs and new names to be updated.
 * @param {number} tagsData.edited[].tagId - The ID of the tag to be updated.
 * @param {string} tagsData.edited[].newTagName - The new name for the tag.
 * @returns {Promise<number[]>} - Returns an array of IDs of the newly inserted tags or an empty array if none were inserted.
 */
export const modifyUserTags = async (userId, { added, deleted, edited }) => {
  const result = await query(
    `WITH deleted_tags AS (
        DELETE FROM tags 
        WHERE id = ANY($1) AND user_id = $2
    ),
    inserted_tags AS (
        INSERT INTO tags (tag_name, user_id)
        SELECT unnest($3::text[]) AS tag_name, $2
        ON CONFLICT (tag_name, user_id) DO NOTHING
        RETURNING id
    ),
    updated_tags AS (
        UPDATE tags
        SET tag_name = new_data.new_name
        FROM (
            SELECT unnest($4::int[]) AS tag_id, unnest($5::text[]) AS new_name
        ) AS new_data
        WHERE tags.id = new_data.tag_id AND tags.user_id = $2
    )
    SELECT COALESCE(jsonb_agg(id), '[]') AS added_ids FROM inserted_tags`,
    [deleted, userId, added, edited.map(tag => tag.tagId), edited.map(tag => tag.newTagName)],
    { onlyFirstRow: true }
  );
  console.log("Inserted tag IDs:", result);
  return result.added_ids;
};



