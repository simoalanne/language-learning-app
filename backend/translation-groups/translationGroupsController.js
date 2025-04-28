import * as translationGroupsModel from "./translationGroupsModel.js";

/**
 * Fetch all public translation groups for a topic
 */
export const getPublicTranslationGroups = async (req, res) => {
  try {
    const { topicId } = req.params;
    const groups = await translationGroupsModel.fetchPublicTranslationGroups(topicId);
    res.json(groups);
  } catch (error) {
    console.error("Error fetching public translation groups:", error);
    res.status(500).json({ message: "Failed to fetch public translation groups." });
  }
};

/**
 * Fetch all translation groups for a topic belonging to the signed-in user
 */
export const getTranslationGroups = async (req, res) => {
  try {
    const { topicId } = req.params;
    const userId = req.user.id;
    const groups = await translationGroupsModel.fetchTranslationGroups(userId, topicId);
    res.json(groups);
  } catch (error) {
    console.error("Error fetching translation groups:", error);
    res.status(500).json({ message: "Failed to fetch translation groups." });
  }
};

/**
 * Add a new word group to the topic
 */
export const addWordGroup = async (req, res) => {
  try {
    const { topicId } = req.body;
    const userId = req.user.id;
    const groupData = req.body.wordGroup;
    const newGroup = await translationGroupsModel.createWordGroup(userId, topicId, groupData);
    res.status(201).json(newGroup);
  } catch (error) {
    console.error("Error adding word group:", error);
    res.status(500).json({ message: "Failed to add word group." });
  }
};

/**
 * Add a new sentence group to the topic
 */
export const addSentenceGroup = async (req, res) => {
  try {
    const { topicId } = req.body;
    const userId = req.user.id;
    const groupData = req.body.sentenceGroup;
    const newGroup = await translationGroupsModel.createSentenceGroup(userId, topicId, groupData);
    res.status(201).json(newGroup);
  } catch (error) {
    console.error("Error adding sentence group:", error);
    res.status(500).json({ message: "Failed to add sentence group." });
  }
};

/**
 * Add a new long text group to the topic
 */
export const addLongTextGroup = async (req, res) => {
  try {
    const { topicId } = req.body;
    const userId = req.user.id;
    const groupData = req.body.longTextGroup;
    const newGroup = await translationGroupsModel.createLongTextGroup(userId, topicId, groupData);
    res.status(201).json(newGroup);
  } catch (error) {
    console.error("Error adding long text group:", error);
    res.status(500).json({ message: "Failed to add long text group." });
  }
};

/**
 * Update an existing word group
 */
export const updateWordGroup = async (req, res) => {
  try {
    const { topicId, groupId } = req.body;
    const userId = req.user.id;
    const updatedData = req.body.wordGroup;
    await translationGroupsModel.updateWordGroup(userId, topicId, groupId, updatedData);
    res.json({ message: "Translation group updated successfully." });
  } catch (error) {
    console.error("Error updating translation group:", error);
    res.status(500).json({ message: "Failed to update translation group." });
  }
};

/**
 * Update an existing sentence group
 */
export const updateSentenceGroup = async (req, res) => {
  try {
    const { topicId, groupId } = req.body;
    const userId = req.user.id;
    const updatedData = req.body.sentenceGroup;
    await translationGroupsModel.updateSentenceGroup(userId, topicId, groupId, updatedData);
    res.json({ message: "Translation group updated successfully." });
  } catch (error) {
    console.error("Error updating translation group:", error);
    res.status(500).json({ message: "Failed to update translation group." });
  }
};

/**
 * Update an existing long text group
 */
export const updateLongTextGroup = async (req, res) => {
  try {
    const { topicId, groupId } = req.body;
    const userId = req.user.id;
    const updatedData = req.body.longTextGroup;
    await translationGroupsModel.updateLongTextGroup(userId, topicId, groupId, updatedData);
    res.json({ message: "Translation group updated successfully." });
  } catch (error) {
    console.error("Error updating translation group:", error);
    res.status(500).json({ message: "Failed to update translation group." });
  }
};

/**
 * Bulk or single deletion of translation groups
 */
export const deleteTranslationGroups = async (req, res) => {
  try {
    const { topicId, groupIds } = req.body; // Expecting topicId and an array of group IDs to delete
    const userId = req.user.id;
    await translationGroupsModel.deleteTranslationGroups(userId, topicId, groupIds);
    res.json({ message: "Translation groups deleted successfully." });
  } catch (error) {
    console.error("Error deleting translation groups:", error);
    res.status(500).json({ message: "Failed to delete translation groups." });
  }
};
