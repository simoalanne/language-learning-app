import express from 'express';
import { addNewWordGroup } from '../db.js';
const wordGroupsRouter = express.Router();

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