import {
  getMultipleWordGroups,
  getWordGroupById,
  addNewWordGroup,
  deleteWordGroupById,
  updateWordGroup,
  getTotalAndPages
} from "../database/db.js";

export const fetchWordGroups = (userId, offset, limit) => getMultipleWordGroups({ offset, limit, getAll: !limit, userId });

export const fetchPublicWordGroups = () => getMultipleWordGroups({ offset: 0, limit: 0, getAll: true });

export const fetchWordGroupById = (groupId, userId) => getWordGroupById(groupId, userId);

export const insertWordGroup = (wordGroupObj, userId) => addNewWordGroup(wordGroupObj, userId);

export const insertBulkWordGroups = async (bulkData, userId) => {
  const ids = [];
  for (const wordGroup of bulkData) {
    const id = await addNewWordGroup(wordGroup, userId);
    ids.push(id);
  }
  return ids;
};

export const removeWordGroup = (groupId, userId) => deleteWordGroupById(groupId, userId);

export const modifyWordGroup = (wordGroupData, userId, groupId) => updateWordGroup(wordGroupData, userId, groupId);

export const fetchTotalPages = (tableName, limit) => getTotalAndPages(tableName, limit);
