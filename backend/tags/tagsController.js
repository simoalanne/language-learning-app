import * as tagsModel from "./tagsModel.js";

export const getUserTags = async (req, res) => {
  try {
    const tags = await tagsModel.getUserTags(req.user.id);
    res.json(tags);
  } catch (error) {
    console.error("Error fetching user tags:", error);
    res.status(500).json({ error: "Failed to fetch user tags" });
  }
};

export const modifyUserTags = async (req, res) => {
  try {
    const newTagIds = await tagsModel.modifyUserTags(req.user.id, req.body);
    return res.status(200).json({newTagIds});
  } catch (error) {
    console.error("Error modifying user tags:", error);
    res.status(500).json({ error: "Failed to modify user tags" });
  }
}
