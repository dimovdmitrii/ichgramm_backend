import { Response } from "express";
import {
  addComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
} from "../services/comments.services.js";
import { AuthRequest } from "../types/interfaces.js";
import validateBody from "../utils/validateBody.js";
import {
  createCommentSchema,
  updateCommentSchema,
} from "../schemas/comment.schema.js";

export const addCommentController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { postId } = req.params;
  if (!postId) {
    res.status(400).json({ message: "Post ID is required" });
    return;
  }
  validateBody(createCommentSchema, { ...req.body, postId });
  const result = await addComment({
    postId,
    content: req.body.content,
    userId: req.user._id,
  });
  res.status(201).json(result);
};

export const getCommentsByPostController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { postId } = req.params;
  if (!postId) {
    res.status(400).json({ message: "Post ID is required" });
    return;
  }
  const result = await getCommentsByPost(postId);
  res.json(result);
};

export const updateCommentController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ message: "Comment ID is required" });
    return;
  }
  validateBody(updateCommentSchema, req.body);
  const result = await updateComment(id, req.user._id, req.body);
  if (!result) {
    res.status(404).json({
      message: "Comment not found or you don't have permission to update it",
    });
    return;
  }
  res.json(result);
};

export const deleteCommentController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ message: "Comment ID is required" });
    return;
  }
  const result = await deleteComment(id, req.user._id);
  if (!result) {
    res.status(404).json({
      message: "Comment not found or you don't have permission to delete it",
    });
    return;
  }
  res.status(204).send();
};

