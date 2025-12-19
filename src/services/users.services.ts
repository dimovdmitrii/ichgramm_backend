import { Types } from "mongoose";
import User from "../db/models/User.js";
import Post from "../db/models/Post.js";
import Like from "../db/models/Like.js";
import Follow from "../db/models/Follow.js";
import RecentSearch from "../db/models/RecentSearch.js";
import HttpError from "../utils/HttpError.js";
import { checkIfFollowing } from "./follows.services.js";

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
  website?: string;
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

export const searchUsersByUsername = async (query: string, limit = 10) => {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const trimmedQuery = query.trim();
  
  // Оптимизация: используем $regex только если запрос длиннее 2 символов
  // Для коротких запросов используем точное совпадение начала строки (быстрее)
  const searchQuery = trimmedQuery.length <= 2
    ? { username: { $regex: `^${trimmedQuery}`, $options: "i" } }
    : { username: { $regex: trimmedQuery, $options: "i" } };

  const users = await User.find(searchQuery)
    .select("username fullName avatar")
    .limit(limit)
    .sort({ username: 1 })
    .lean(); // Используем lean() для быстрого получения простых объектов

  return users;
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
  // Оптимизация: используем поле likesCount из постов напрямую через простой запрос
  // Это намного быстрее, чем агрегация или запросы к коллекции likes
  try {
    // Используем простой запрос с суммированием вместо агрегации для лучшей производительности
    const posts = await Post.find({ author: userId })
      .select("likesCount")
      .lean();
    
    if (posts.length === 0) {
      return 0;
    }
    
    // Суммируем likesCount из всех постов
    return posts.reduce((total, post) => total + (post.likesCount || 0), 0);
  } catch (error) {
    // Fallback: если произошла ошибка, возвращаем 0
    console.error("Error in getTotalLikesCount:", error);
    return 0;
  }
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
  if (user.website) profile.website = user.website;

  return profile;
};

export const getUserProfileByUsername = async (
  username: string,
  currentUserId?: string | Types.ObjectId,
): Promise<UserProfile & { isFollowing?: boolean }> => {
  const user = await User.findOne({ username }).select(
    "-password -accessToken -refreshToken",
  );
  if (!user) {
    throw HttpError(404, "User not found");
  }

  const stats = await getUserStats(user._id);

  const profile: UserProfile & { isFollowing?: boolean } = {
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
  if (user.website) profile.website = user.website;

  // Проверяем, подписан ли текущий пользователь на этого пользователя
  // Оптимизация: используем более быстрый запрос напрямую с .lean() и .select()
  if (currentUserId && currentUserId.toString() !== user._id.toString()) {
    try {
      const follow = await Follow.findOne({
        follower: currentUserId,
        following: user._id,
      })
        .select("_id")
        .lean();
      profile.isFollowing = !!follow;
    } catch (error) {
      console.error("Error checking follow status:", error);
      profile.isFollowing = false;
    }
  } else {
    profile.isFollowing = false;
  }

  return profile;
};

export const updateUserProfile = async (
  userId: string | Types.ObjectId,
  updates: {
    username?: string;
    fullName?: string;
    bio?: string;
    website?: string;
    avatar?: string;
  },
) => {
  // Если обновляется username, проверяем уникальность
  if (updates.username) {
    const existingUser = await User.findOne({
      username: updates.username,
      _id: { $ne: userId },
    });
    if (existingUser) {
      throw HttpError(409, "Username already exist");
    }
  }

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

export const addRecentSearch = async (
  userId: string | Types.ObjectId,
  searchedUserId: string | Types.ObjectId,
) => {
  try {
    // Проверяем, что пользователь не ищет сам себя
    if (userId.toString() === searchedUserId.toString()) {
      return;
    }

    // Проверяем существование записи
    const existingSearch = await RecentSearch.findOne({
      user: userId,
      searchedUser: searchedUserId,
    });

    if (existingSearch) {
      // Обновляем время последнего поиска
      existingSearch.updatedAt = new Date();
      await existingSearch.save();
    } else {
      // Создаем новую запись
      await RecentSearch.create({
        user: userId,
        searchedUser: searchedUserId,
      });
    }

    // Ограничиваем количество недавних поисков до 5
    const allSearches = await RecentSearch.find({ user: userId })
      .sort({ updatedAt: -1 })
      .select("_id");

    if (allSearches.length > 5) {
      const searchesToDelete = allSearches.slice(5);
      const idsToDelete = searchesToDelete.map((s) => s._id);
      await RecentSearch.deleteMany({ _id: { $in: idsToDelete } });
    }
  } catch (error: any) {
    console.error("Add recent search service error:", error);
    throw HttpError(500, error.message || "Failed to add recent search");
  }
};

export const getRecentSearches = async (
  userId: string | Types.ObjectId,
): Promise<Array<{ _id: string; username: string; avatar?: string }>> => {
  const recentSearches = await RecentSearch.find({ user: userId })
    .sort({ updatedAt: -1 })
    .limit(5)
    .populate("searchedUser", "username avatar")
    .exec();

  return recentSearches.map((search: any) => ({
    _id: search.searchedUser._id.toString(),
    username: search.searchedUser.username,
    avatar: search.searchedUser.avatar || null,
  }));
};

export const clearRecentSearches = async (userId: string | Types.ObjectId) => {
  await RecentSearch.deleteMany({ user: userId });
};
