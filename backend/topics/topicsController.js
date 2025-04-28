import * as topicsModel from './topicsModel.js';

export const getPublicTopics = async (_, res) => {
  try {
    const topics = await topicsModel.fetchPublicTopics();
    res.json(topics);
  } catch (error) {
    console.error('Error fetching public topics:', error);
    res.status(500).json({ error: 'Failed to fetch public topics' });
  }
};

export const getUserTopics = async (req, res) => {
  try {
    const topics = await topicsModel.fetchUserTopics(req.user.id);
    res.json(topics);
  } catch (error) {
    console.error('Error fetching user topics:', error);
    res.status(500).json({ error: 'Failed to fetch user topics' });
  }
};

export const addTopic = async (req, res) => {
  try {
    const newTopic = await topicsModel.createTopic(req.user.id, req.body);
    res.status(201).json(newTopic);
  } catch (error) {
    console.error('Error adding topic:', error);
    res.status(500).json({ error: 'Failed to add topic' });
  }
};

export const updateTopic = async (req, res) => {
  try {
    await topicsModel.updateTopic(req.user.id, req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(500).json({ error: 'Failed to update topic' });
  }
};

export const deleteTopic = async (req, res) => {
  try {
    await topicsModel.deleteTopic(req.user.id, req.params.id);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error deleting topic:', error);
    res.status(500).json({ error: 'Failed to delete topic' });
  }
};

export const deleteAllTopics = async (req, res) => {
  try {
    await topicsModel.deleteAllTopics(req.user.id);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error deleting all topics:', error);
    res.status(500).json({ error: 'Failed to delete all topics' });
  }
};
