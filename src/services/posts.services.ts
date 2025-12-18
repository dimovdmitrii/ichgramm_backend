import { Types } from "mongoose";
import Post from "../db/models/Post.js";
import { CreatePostPayload } from "../schemas/post.schema.js";

type NewPostPayload = CreatePostPayload & { author: Types.ObjectId };

export const getPosts = () =>
  Post.find()
    .populate("author", "username fullName email avatar")
    .sort({ createdAt: -1 });

export const getPostsByUser = async (userId: string | Types.ObjectId) => {
  console.log("getPostsByUser - userId:", userId, "type:", typeof userId);
  
  // Конвертируем строку в ObjectId, если нужно
  const authorId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;
  console.log("getPostsByUser - authorId:", authorId);
  
  // Также пробуем найти по строке (на случай, если в БД хранится как строка)
  const posts = await Post.find({
    $or: [
      { author: authorId },
      { author: userId }
    ]
  })
    .populate("author", "username fullName email avatar")
    .sort({ createdAt: -1 });
  
  console.log("getPostsByUser - found posts:", posts.length);
  
  // Логируем все посты для отладки
  if (posts.length === 0) {
    const allPosts = await Post.find().populate("author", "username fullName email avatar");
    console.log("All posts in DB:", allPosts.length);
    allPosts.forEach((post, idx) => {
      console.log(`Post ${idx + 1}: author=`, post.author, "type:", typeof post.author, "author._id:", post.author?._id?.toString());
    });
  }
  
  return posts;
};

export const getPostById = (postId: string) =>
  Post.findById(postId).populate("author", "username fullName email avatar");

export const addPost = (payload: NewPostPayload) => Post.create(payload);

export const updatePost = (
  postId: string,
  authorId: Types.ObjectId,
  payload: Partial<CreatePostPayload>,
) =>
  Post.findOneAndUpdate({ _id: postId, author: authorId }, payload, {
    new: true,
    runValidators: true,
  }).populate("author", "username fullName email avatar");

export const deletePost = (postId: string, authorId: Types.ObjectId) =>
  Post.findOneAndDelete({ _id: postId, author: authorId });
