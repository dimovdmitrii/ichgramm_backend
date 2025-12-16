import { Types } from "mongoose";
import Comment from "../db/models/Comment.js";
import Post from "../db/models/Post.js";
import HttpError from "../utils/HttpError.js";
import {
  CreateCommentPayload,
  UpdateCommentPayload,
} from "../schemas/comment.schema.js";

export const addComment = async (
  payload: CreateCommentPayload & { userId: Types.ObjectId },
) => {
  const post = await Post.findById(payload.postId);
  if (!post) {
    throw HttpError(404, "Post not found");
  }

  return Comment.create({
    post: payload.postId,
    user: payload.userId,
    content: payload.content,
  }).then((comment) => comment.populate("user", "username fullName email"));
};

export const getCommentsByPost = (postId: string) =>
  Comment.find({ post: postId })
    .populate("user", "username fullName email")
    .sort({ createdAt: -1 });

export const updateComment = async (
  commentId: string,
  userId: Types.ObjectId,
  payload: UpdateCommentPayload,
) => {
  const comment = await Comment.findOne({ _id: commentId, user: userId });
  if (!comment) {
    throw HttpError(
      404,
      "Comment not found or you don't have permission to update it",
    );
  }

  return Comment.findByIdAndUpdate(
    commentId,
    { content: payload.content },
    { new: true, runValidators: true },
  ).populate("user", "username fullName email");
};

export const deleteComment = async (
  commentId: string,
  userId: Types.ObjectId,
) => {
  const comment = await Comment.findOne({ _id: commentId, user: userId });
  if (!comment) {
    throw HttpError(
      404,
      "Comment not found or you don't have permission to delete it",
    );
  }

  return Comment.findByIdAndDelete(commentId);
};
