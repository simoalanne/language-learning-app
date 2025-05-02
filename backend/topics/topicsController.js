import * as topicsModel from './topicsModel.js';

export const getPublicTopics = async (_, res) => {
  try {
    const topics = await topicsModel.fetchTopics();
    res.json(topics);
  } catch (error) {
    console.error('Error fetching public topics:', error);
    res.status(500).json({ error: 'Failed to fetch public topics' });
  }
};

export const getUserTopics = async (req, res) => {
  try {
    const topics = await topicsModel.fetchTopics(req.user.id);
    res.json(topics);
  } catch (error) {
    console.error('Error fetching user topics:', error);
    res.status(500).json({ error: 'Failed to fetch user topics' });
  }
};

export const addTopic = async (req, res) => {
  try {
    const id = await topicsModel.createTopic(req.user.id, req.body.name, req.body.isPublic);
    res.status(201).json({ id });
  } catch (error) {
    console.error('Error adding topic:', error);
    res.status(500).json({ error: 'Failed to add topic' });
  }
};

export const updateTopic = async (req, res) => {
  try {
    await topicsModel.updateTopic(req.user.id, req.body.topicId, req.body.name, req.body.isPublic);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(500).json({ error: 'Failed to update topic' });
  }
};

export const deleteMultipleTopics = async (req, res) => {
  try {
    await topicsModel.deleteMultipleTopics(req.user.id, req.body.topicIds);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error deleting all topics:', error);
    res.status(500).json({ error: 'Failed to delete all topics' });
  }
};
