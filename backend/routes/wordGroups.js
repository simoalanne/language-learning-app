import express from "express";
import {
  addNewWordGroup,
  getWordGroupById,
  getAllWordGroupIds,
  deleteWordGroupById,
  deleteAllWordGroups,
  updateWordGroup,
  getNextGroupId,
} from "../database/db.js";
const wordGroupsRouter = express.Router();

wordGroupsRouter.get("/", async (_, res) => {
  const ids = await getAllWordGroupIds();
  const wordGroups = await Promise.all(
    ids.map(async (id) => await getWordGroupById(id))
  );
  res.json(wordGroups);
});

wordGroupsRouter.get("/:id", async (req, res) => {
  try {
    const groupId = parseInt(req.params.id);
    if (isNaN(groupId)) {
      return res.status(400).json({ error: "Invalid group ID" });
    }

    const response = await getWordGroupById(groupId);

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

// add validation logic later that ensures that structure is correct and unique where required
wordGroupsRouter.post("/", async (req, res) => {
  try {
    const wordGroupObj = req.body;
    const id = await addNewWordGroup(wordGroupObj);
    res.json(id);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

wordGroupsRouter.post("/bulk", async (req, res) => {
  try {
    const wordGroups = req.body.bulkData;
    console.log(`Adding ${wordGroups.length} word groups`);
    const ids = [];
    // For loop instead of map and await Promise.all because for the id to update correctly
    // the previous operation must finish before the next one starts.
    for (const wordGroup of wordGroups) {
      const id = await addNewWordGroup(wordGroup);
      ids.push(id);
    }
    res.json(ids);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

wordGroupsRouter.delete("/", async (_, res) => {
  try {
    const id = await deleteAllWordGroups();
    res.json(id);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

wordGroupsRouter.delete("/:id", async (req, res) => {
  try {
    const groupId = parseInt(req.params.id);
    if (isNaN(groupId)) {
      return res.status(400).json({ error: "Invalid group ID" });
    }
    const id = await deleteWordGroupById(groupId);
    res.json(id);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

wordGroupsRouter.put("/:id", async (req, res) => {
  try {
    const groupId = parseInt(req.params.id);
    if (isNaN(groupId)) {
      return res.status(400).json({ error: "Invalid group ID" });
    }

    const wordGroupObj = { id: groupId, ...req.body };
    const response = await updateWordGroup(wordGroupObj);
    if (response?.error) {
      return res.status(400).json(response);
    }
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default wordGroupsRouter;
