import express from "express";
import { addNewWordGroup, getWordGroupById } from "../db.js";
const wordGroupsRouter = express.Router();

wordGroupsRouter.get("/", async (_, res) => {
  const response = await getWordGroupById(1); // get the first word group
  res.json(response);
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

export default wordGroupsRouter;
