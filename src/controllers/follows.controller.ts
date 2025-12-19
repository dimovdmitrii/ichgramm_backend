import { Response } from "express";
import { toggleFollow, getFollowers, getFollowing } from "../services/follows.services.js";
import { AuthRequest } from "../types/interfaces.js";

export const toggleFollowController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { username } = req.params;
    if (!username) {
      res.status(400).json({ message: "Username is required" });
      return;
    }
    
    // Убеждаемся, что req.user._id является ObjectId
    const followerId = req.user._id;
    if (!followerId) {
      res.status(401).json({ message: "User ID not found" });
      return;
    }
    
    const result = await toggleFollow(followerId, username);
    res.json(result);
  } catch (error: any) {
    console.error("Toggle follow error:", error);
    const status = error?.status || error?.response?.status || 500;
    const message = error?.message || error?.response?.data?.message || "Internal server error";
    res.status(status).json({
      message,
    });
  }
};

export const getFollowersController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { username } = req.params;
  if (!username) {
    res.status(400).json({ message: "Username is required" });
    return;
  }

  const User = (await import("../db/models/User.js")).default;
  const user = await User.findOne({ username });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const followers = await getFollowers(user._id);
  res.json(followers);
};

export const getFollowingController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { username } = req.params;
  if (!username) {
    res.status(400).json({ message: "Username is required" });
    return;
  }

  const User = (await import("../db/models/User.js")).default;
  const user = await User.findOne({ username });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const following = await getFollowing(user._id);
  res.json(following);
};


