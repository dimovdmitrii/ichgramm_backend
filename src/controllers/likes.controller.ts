import { Response } from "express";
import {
  toggleLike,
  getLikesByPost,
  getUserLikes,
} from "../services/likes.services.js";
import { AuthRequest } from "../types/interfaces.js";

export const toggleLikeController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { postId } = req.params;
  if (!postId) {
    res.status(400).json({ message: "Post ID is required" });
    return;
  }
  const result = await toggleLike(postId, req.user._id);
  res.json(result);
};

export const getLikesByPostController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { postId } = req.params;
  if (!postId) {
    res.status(400).json({ message: "Post ID is required" });
    return;
  }
  const result = await getLikesByPost(postId);
  res.json(result);
};

export const getUserLikesController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const result = await getUserLikes(req.user._id);
  res.json(result);
};
