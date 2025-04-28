import * as usersModel from './usersModel.js';
import * as authUtils from '../utils/authUtils.js';

export const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await authUtils.hashPassword(password);
    const userId = await usersModel.createUser(username, hashedPassword);
    if (!userId) {
      return res.status(409).json({ error: "Username already exists." });
    }
    const token = authUtils.generateJwtToken({ username, id: userId });
    res.status(201).json({ token });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await usersModel.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const isPasswordValid = await authUtils.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const token = authUtils.generateJwtToken({ username, id: user.id });
    res.json({ token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Failed to log in user" });
  }
};


export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;
    const user = await usersModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isOldPasswordValid = await authUtils.verifyPassword(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(401).json({ error: "The old password is incorrect" });
    }
    // hash the new password and update it in the database
    const hashedNewPassword = await authUtils.hashPassword(newPassword);
    const success = await usersModel.changePassword(userId, hashedNewPassword);
    if (!success) {
      return res.status(500).json({ error: "Failed to change password" });
    }
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
};

export const changeUsername = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newUsername } = req.body;
    const success = await usersModel.changeUsername(userId, newUsername);
    if (!success) {
      return res.status(409).json({ error: "Username already exists." });
    }
    res.sendStatus(200);
  } catch (error) {
    console.error("Error changing username:", error);
    res.status(500).json({ error: "Failed to change username" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userProfile = await usersModel.getUserProfile(userId);
    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }
    res.json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const success = await usersModel.updateUserProfile(userId, req.body);
    if (!success) {
      return res.status(400).json({ error: "Failed to update user profile" });
    }
    res.status(200).json({ message: "Profile updated successfully" });
  }
  catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Failed to update user profile" });
  }
};

export const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    // should verify the password before deleting the account
    const { password } = req.body;
    const user = await usersModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User account not found" });
    }
    const isPasswordValid = await authUtils.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }
    const success = await usersModel.deleteUserAccount(userId);
    if (!success) {
      return res.status(404).json({ error: "User account not found" });
    }
    res.status(200).json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("Error deleting user account:", error);
    res.status(500).json({ error: "Failed to delete user account" });
  }
};
