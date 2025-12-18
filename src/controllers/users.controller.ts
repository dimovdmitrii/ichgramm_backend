import { Response } from "express";
import {
  getUserProfile,
  getUserProfileByUsername,
  updateUserProfile,
  searchUsersByUsername,
} from "../services/users.services.js";
import { AuthRequest } from "../types/interfaces.js";
import validateBody from "../utils/validateBody.js";
import { updateProfileSchema } from "../schemas/user.schema.js";

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
  const profile = await getUserProfileByUsername(username);
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

