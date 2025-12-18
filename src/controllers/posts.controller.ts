import { Response } from "express";
import {
  getPosts,
  getPostById,
  addPost,
  updatePost,
  deletePost,
  getPostsByUser,
} from "../services/posts.services.js";
import { AuthRequest } from "../types/interfaces.js";
import validateBody from "../utils/validateBody.js";
import { createPostSchema, updatePostSchema } from "../schemas/post.schema.js";

export const getPostsController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { userId } = req.query;
  console.log(
    "getPostsController - userId from query:",
    userId,
    "type:",
    typeof userId,
  );
  let result;
  if (userId) {
    console.log("Fetching posts for user:", userId);
    result = await getPostsByUser(userId as string);
    console.log(
      "Posts found:",
      Array.isArray(result) ? result.length : "not an array",
      result,
    );
  } else {
    console.log("Fetching all posts");
    result = await getPosts();
  }
  res.json(result);
};

export const getPostByIdController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ message: "Post ID is required" });
    return;
  }
  const result = await getPostById(id);
  if (!result) {
    res.status(404).json({ message: "Post not found" });
    return;
  }
  res.json(result);
};

export const addPostController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  validateBody(createPostSchema, req.body);
  const result = await addPost({ ...req.body, author: req.user._id });
  res.status(201).json(result);
};

export const updatePostController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ message: "Post ID is required" });
    return;
  }
  validateBody(updatePostSchema, req.body);
  const result = await updatePost(id, req.user._id, req.body);
  if (!result) {
    res.status(404).json({
      message: "Post not found or you don't have permission to update it",
    });
    return;
  }
  res.json(result);
};

export const deletePostController = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ message: "Post ID is required" });
    return;
  }
  const result = await deletePost(id, req.user._id);
  if (!result) {
    res.status(404).json({
      message: "Post not found or you don't have permission to delete it",
    });
    return;
  }
  res.status(204).send();
};
