import { Types } from "mongoose";
import Post from "../db/models/Post.js";
import { CreatePostPayload } from "../schemas/post.schema.js";

type NewPostPayload = CreatePostPayload & { author: Types.ObjectId };

export const getPosts = () =>
  Post.find()
    .populate("author", "username fullName email")
    .sort({ createdAt: -1 });

export const getPostById = (postId: string) =>
  Post.findById(postId).populate("author", "username fullName email");

export const addPost = (payload: NewPostPayload) => Post.create(payload);

export const updatePost = (
  postId: string,
  authorId: Types.ObjectId,
  payload: Partial<CreatePostPayload>,
) =>
  Post.findOneAndUpdate({ _id: postId, author: authorId }, payload, {
    new: true,
    runValidators: true,
  }).populate("author", "username fullName email");

export const deletePost = (postId: string, authorId: Types.ObjectId) =>
  Post.findOneAndDelete({ _id: postId, author: authorId });
