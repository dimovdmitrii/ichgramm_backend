import { Types } from "mongoose";
import Like from "../db/models/Like.js";
import Post from "../db/models/Post.js";
import HttpError from "../utils/HttpError.js";

export const toggleLike = async (postId: string, userId: Types.ObjectId) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw HttpError(404, "Post not found");
  }

  const existingLike = await Like.findOne({ post: postId, user: userId });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });
    return { liked: false };
  } else {
    await Like.create({ post: postId, user: userId });
    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });
    return { liked: true };
  }
};

export const getLikesByPost = (postId: string) =>
  Like.find({ post: postId })
    .populate("user", "username fullName")
    .sort({ createdAt: -1 });

export const getUserLikes = (userId: Types.ObjectId) =>
  Like.find({ user: userId })
    .populate("post", "content image")
    .sort({ createdAt: -1 });
