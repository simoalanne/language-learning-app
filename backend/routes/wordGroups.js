import express from "express";
import {
  addNewWordGroup,
  getWordGroupById,
  getAllWordGroupIds,
  deleteWordGroupById,
  deleteAllWordGroups,
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
    const response = await addNewWordGroup(wordGroupObj);
    res.send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

wordGroupsRouter.delete("/", async (_, res) => {
  try {
    await deleteAllWordGroups();
    res.json({ message: "All word groups deleted" });
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
    await deleteWordGroupById(groupId);
    res.json({ message: `Word group ${groupId} deleted`} );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

export default wordGroupsRouter;
