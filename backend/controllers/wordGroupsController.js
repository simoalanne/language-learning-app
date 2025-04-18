import {
  fetchWordGroups,
  fetchPublicWordGroups,
  fetchWordGroupById,
  insertWordGroup,
  insertBulkWordGroups,
  removeWordGroup,
  modifyWordGroup
} from "../services/wordGroupsService.js";

export const getWordGroups = async (req, res) => {
  try {
    const includePagination = req.query.paginationIncluded === "true";
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit);
    const wordGroups = await fetchWordGroups(req.user.id, offset, limit);
    
    if (!includePagination) return res.json(wordGroups);
    
    const { total, pages } = await fetchTotalPages("word_groups", limit);
    res.json({ wordGroups, pagination: { total, limit, offset, pages } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching word groups" });
  }
};

export const getPublicWordGroups = async (_, res) => {
  try {
    const wordGroups = await fetchPublicWordGroups();
    res.json(wordGroups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching public word groups" });
  }
};

export const getWordGroup = async (req, res) => {
  try {
    const groupId = parseInt(req.params.id);
    const response = await fetchWordGroupById(groupId, req.user.id);
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error retrieving word group" });
  }
};

export const createWordGroup = async (req, res) => {
  try {
    const id = await insertWordGroup(req.body, req.user.id);
    res.json(id);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error adding word group" });
  }
};

export const createBulkWordGroups = async (req, res) => {
  try {
    const ids = await insertBulkWordGroups(req.body.bulkData, req.user.id);
    res.json(ids);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error adding bulk word groups" });
  }
};

export const deleteWordGroup = async (req, res) => {
  try {
    const id = await removeWordGroup(parseInt(req.params.id), req.user.id);
    res.json(id);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error deleting word group" });
  }
};

export const updateWordGroup = async (req, res) => {
  try {
    const response = await modifyWordGroup(req.body, req.user.id, parseInt(req.params.id));
    res.status(response?.error ? 400 : 200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error updating word group" });
  }
};
