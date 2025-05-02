import * as translationGroupsModel from "./translationGroupsModel.js";

export const getPublicTranslationGroups = async (req, res) => {
  try {
    const { topicId, groupType, minDifficultyLevel } = req.query;
    const userId = null; // Public groups do not require a user ID
    const groups = await translationGroupsModel.fetchTranslationGroups(userId, topicId, groupType, minDifficultyLevel);
    res.json(groups);
  } catch (error) {
    console.error("Error fetching public translation groups:", error);
    res.status(500).json({ message: "Failed to fetch public translation groups." });
  }
};

export const getTranslationGroups = async (req, res) => {
  try {
    const { topicId, groupType, minDifficultyLevel } = req.query;
    const userId = req.user.id;
    const groups = await translationGroupsModel.fetchTranslationGroups(userId, topicId, groupType, minDifficultyLevel);
    res.json(groups);
  } catch (error) {
    console.error("Error fetching translation groups:", error);
    res.status(500).json({ message: "Failed to fetch translation groups." });
  }
};

export const addTranslationGroups = async (req, res) => {
  try {
    const { topicId, groupsData } = req.body;
    const userId = req.user.id;
    const ids = await translationGroupsModel.createTranslationGroups(userId, topicId, groupsData);
    res.status(201).json({ ids });

  } catch (error) {
    console.error("Error adding translation group:", error);
    res.status(500).json({ message: "Failed to add translation group." });
  }
}

export const updateTranslationGroup = async (req, res) => {
  try {
    const { topicId, groupData } = req.body;
    const userId = req.user.id;
    const success = await translationGroupsModel.updateTranslationGroup(userId, topicId, groupData);
    if (!success) {
      return res.status(404).json({ message: "Translation group not found." });
    }
    res.status(200).json({ message: "Translation group updated successfully." });
  } catch (error) {
    console.error("Error updating translation group:", error);
    res.status(500).json({ message: "Failed to update translation group." });
  }
}

export const deleteTranslationGroups = async (req, res) => {
  try {
    const { topicId, groupIds } = req.body;
    const userId = req.user.id;
    await translationGroupsModel.deleteTranslationGroups(userId, topicId, groupIds);
    res.json({ message: "Translation groups deleted successfully." });
  } catch (error) {
    console.error("Error deleting translation groups:", error);
    res.status(500).json({ message: "Failed to delete translation groups." });
  }
};
