import { Types } from "mongoose";
import Follow from "../db/models/Follow.js";
import User from "../db/models/User.js";
import HttpError from "../utils/HttpError.js";

export const toggleFollow = async (
  followerId: Types.ObjectId,
  followingUsername: string,
) => {
  try {
    const followingUser = await User.findOne({ username: followingUsername });
    if (!followingUser) {
      throw HttpError(404, "User not found");
    }

    if (followerId.toString() === followingUser._id.toString()) {
      throw HttpError(400, "Cannot follow yourself");
    }

    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: followingUser._id,
    });

    if (existingFollow) {
      await Follow.findByIdAndDelete(existingFollow._id);
      
      // Обновляем счетчики: уменьшаем followingCount у подписчика и followersCount у подписки
      // Используем findByIdAndUpdate с runValidators: false, чтобы избежать проблем с валидацией
      await User.findByIdAndUpdate(
        followerId,
        { $inc: { followingCount: -1 } },
        { runValidators: false, new: false }
      );
      await User.findByIdAndUpdate(
        followingUser._id,
        { $inc: { followersCount: -1 } },
        { runValidators: false, new: false }
      );
      
      return { followed: false, message: "Unfollowed successfully" };
    } else {
      await Follow.create({
        follower: followerId,
        following: followingUser._id,
      });
      
      // Обновляем счетчики: увеличиваем followingCount у подписчика и followersCount у подписки
      // Используем findByIdAndUpdate с runValidators: false, чтобы избежать проблем с валидацией
      await User.findByIdAndUpdate(
        followerId,
        { $inc: { followingCount: 1 } },
        { runValidators: false, new: false }
      );
      await User.findByIdAndUpdate(
        followingUser._id,
        { $inc: { followersCount: 1 } },
        { runValidators: false, new: false }
      );
      
      return { followed: true, message: "Followed successfully" };
    }
  } catch (error: any) {
    console.error("Toggle follow error:", error);
    if (error.status) {
      throw error;
    }
    throw HttpError(500, error.message || "Internal server error");
  }
};

export const getFollowers = async (userId: string | Types.ObjectId) => {
  return Follow.find({ following: userId })
    .populate("follower", "username fullName avatar")
    .sort({ createdAt: -1 });
};

export const getFollowing = async (userId: string | Types.ObjectId) => {
  return Follow.find({ follower: userId })
    .populate("following", "username fullName avatar")
    .sort({ createdAt: -1 });
};

export const checkIfFollowing = async (
  followerId: Types.ObjectId,
  followingId: string | Types.ObjectId,
): Promise<boolean> => {
  const follow = await Follow.findOne({
    follower: followerId,
    following: followingId,
  });
  return !!follow;
};


