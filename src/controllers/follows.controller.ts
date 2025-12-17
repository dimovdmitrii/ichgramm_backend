import { Response } from "express";
import { toggleFollow, getFollowers, getFollowing } from "../services/follows.services.js";
import { AuthRequest } from "../types/interfaces.js";

export const toggleFollowController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { username } = req.params;
  if (!username) {
    res.status(400).json({ message: "Username is required" });
    return;
  }
  const result = await toggleFollow(req.user._id, username);
  res.json(result);
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

