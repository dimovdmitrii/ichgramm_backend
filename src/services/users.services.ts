import { Types } from "mongoose";
import User from "../db/models/User.js";
import Post from "../db/models/Post.js";
import Like from "../db/models/Like.js";
import Follow from "../db/models/Follow.js";
import HttpError from "../utils/HttpError.js";

export interface UserStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  totalLikesCount: number;
}

export interface UserProfile extends UserStats {
  _id: Types.ObjectId;
  email: string;
  fullName: string;
  username: string;
  avatar?: string;
  bio?: string;
  verify: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const getUserById = async (userId: string) => {
  const user = await User.findById(userId).select(
    "-password -accessToken -refreshToken",
  );
  if (!user) {
    throw HttpError(404, "User not found");
  }
  return user;
};

export const getUserByUsername = async (username: string) => {
  const user = await User.findOne({ username }).select(
    "-password -accessToken -refreshToken",
  );
  if (!user) {
    throw HttpError(404, "User not found");
  }
  return user;
};

export const getPostsCount = async (
  userId: string | Types.ObjectId,
): Promise<number> => {
  return Post.countDocuments({ author: userId });
};

export const getFollowersCount = async (
  userId: string | Types.ObjectId,
): Promise<number> => {
  return Follow.countDocuments({ following: userId });
};

export const getFollowingCount = async (
  userId: string | Types.ObjectId,
): Promise<number> => {
  return Follow.countDocuments({ follower: userId });
};

export const getTotalLikesCount = async (
  userId: string | Types.ObjectId,
): Promise<number> => {
  const userPosts = await Post.find({ author: userId }).select("_id");
  const postIds = userPosts.map((post) => post._id);
  return Like.countDocuments({ post: { $in: postIds } });
};

export const getUserStats = async (
  userId: string | Types.ObjectId,
): Promise<UserStats> => {
  const [postsCount, followersCount, followingCount, totalLikesCount] =
    await Promise.all([
      getPostsCount(userId),
      getFollowersCount(userId),
      getFollowingCount(userId),
      getTotalLikesCount(userId),
    ]);

  return {
    postsCount,
    followersCount,
    followingCount,
    totalLikesCount,
  };
};

export const getUserProfile = async (
  userId: string | Types.ObjectId,
): Promise<UserProfile> => {
  const user = await User.findById(userId).select(
    "-password -accessToken -refreshToken",
  );
  if (!user) {
    throw HttpError(404, "User not found");
  }

  const stats = await getUserStats(userId);

  const profile: UserProfile = {
    _id: user._id,
    email: user.email,
    fullName: user.fullName,
    username: user.username,
    verify: user.verify,
    ...stats,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  if (user.avatar) profile.avatar = user.avatar;
  if (user.bio) profile.bio = user.bio;

  return profile;
};

export const getUserProfileByUsername = async (
  username: string,
): Promise<UserProfile> => {
  const user = await User.findOne({ username }).select(
    "-password -accessToken -refreshToken",
  );
  if (!user) {
    throw HttpError(404, "User not found");
  }

  const stats = await getUserStats(user._id);

  const profile: UserProfile = {
    _id: user._id,
    email: user.email,
    fullName: user.fullName,
    username: user.username,
    verify: user.verify,
    ...stats,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  if (user.avatar) profile.avatar = user.avatar;
  if (user.bio) profile.bio = user.bio;

  return profile;
};

export const updateUserProfile = async (
  userId: string | Types.ObjectId,
  updates: { fullName?: string; bio?: string; avatar?: string },
) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true },
  ).select("-password -accessToken -refreshToken");

  if (!user) {
    throw HttpError(404, "User not found");
  }

  return user;
};
