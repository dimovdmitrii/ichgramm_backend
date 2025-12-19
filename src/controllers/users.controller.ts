import { Response } from "express";
import {
  getUserProfile,
  getUserProfileByUsername,
  updateUserProfile,
  searchUsersByUsername,
  addRecentSearch,
  getRecentSearches,
  clearRecentSearches,
} from "../services/users.services.js";
import { AuthRequest } from "../types/interfaces.js";
import validateBody from "../utils/validateBody.js";
import { updateProfileSchema } from "../schemas/user.schema.js";
import User from "../db/models/User.js";

export const getProfileController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const profile = await getUserProfile(req.user._id);
  res.json(profile);
};

export const getProfileByUsernameController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { username } = req.params;
  if (!username) {
    res.status(400).json({ message: "Username is required" });
    return;
  }
  const profile = await getUserProfileByUsername(username, req.user._id);
  res.json(profile);
};

export const updateProfileController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  validateBody(updateProfileSchema, req.body);
  const updatedUser = await updateUserProfile(req.user._id, req.body);
  res.json(updatedUser);
};

export const searchUsersController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { q } = req.query;
  if (!q || typeof q !== "string") {
    res.status(400).json({ message: "Search query is required" });
    return;
  }
  const users = await searchUsersByUsername(q);
  res.json(users);
};

export const getRecentSearchesController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const recentSearches = await getRecentSearches(req.user._id);
  res.json(recentSearches);
};

export const addRecentSearchController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { username } = req.body;
    if (!username || typeof username !== "string") {
      res.status(400).json({ message: "Username is required" });
      return;
    }

    const searchedUser = await User.findOne({ username });
    if (!searchedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await addRecentSearch(req.user._id, searchedUser._id);
    res.json({ message: "Recent search added successfully" });
  } catch (error: any) {
    console.error("Add recent search error:", error);
    res.status(error?.status || 500).json({
      message: error?.message || "Internal server error",
    });
  }
};

export const clearRecentSearchesController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  await clearRecentSearches(req.user._id);
  res.json({ message: "Recent searches cleared successfully" });
};

