import bcrypt from "bcrypt";

import {
  RegisterPayload,
  LoginPayload,
  RefreshPayload,
} from "../schemas/auth.schemas.js";

import HttpError from "../utils/HttpError.js";

import User, { UserDocument } from "../db/models/User.js";

import { verifyToken } from "../utils/jwt.js";
import createTokens from "../utils/createTokens.js";
import { getUserStats } from "./users.services.js";

export type UserFindResult = UserDocument | null;

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    _id: string;
    email: string;
    fullName: string;
    username: string;
    avatar?: string;
    bio?: string;
    website?: string;
    postsCount: number;
    followersCount: number;
    followingCount: number;
    totalLikesCount: number;
  };
}

//@ts-expect-error
export const findUser = (query) => User.findOne(query);

export const registerUser = async (
  payload: RegisterPayload,
): Promise<UserDocument> => {
  const user: UserFindResult = await findUser({ email: payload.email });
  if (user) throw HttpError(409, "Email already exist");

  const userByUsername = await User.findOne({ username: payload.username });
  if (userByUsername) throw HttpError(409, "Username already exist");

  const hashPassword = await bcrypt.hash(payload.password, 10);
  return User.create({ ...payload, password: hashPassword });
};

export const loginUser = async (
  payload: LoginPayload,
): Promise<LoginResult> => {
  const user: UserFindResult = await findUser({
    $or: [{ username: payload.username }, { email: payload.username }],
  });
  if (!user) throw HttpError(401, "User not found");
  const passwordCompare = await bcrypt.compare(payload.password, user.password);
  if (!passwordCompare) throw HttpError(401, "Password invalid!");

  const { accessToken, refreshToken } = createTokens(user._id, user.username);

  await User.findByIdAndUpdate(user._id, { accessToken, refreshToken });

  const stats = await getUserStats(user._id);

  const userData: LoginResult["user"] = {
    _id: user._id.toString(),
    email: user.email,
    fullName: user.fullName,
    username: user.username,
    ...stats,
  };

  if (user.avatar) userData.avatar = user.avatar;
  if (user.bio) userData.bio = user.bio;
  if (user.website) userData.website = user.website;

  return {
    accessToken,
    refreshToken,
    user: userData,
  };
};

export const refreshUser = async (
  payload: RefreshPayload,
): Promise<LoginResult> => {
  const { data: tokenPayload, error } = verifyToken(payload.refreshToken);

  if (error) throw HttpError(401, "Invalid refresh token");
  if (!tokenPayload || !tokenPayload.id)
    throw HttpError(401, "Invalid token payload");

  const user: UserFindResult = await findUser({ _id: tokenPayload.id });
  if (!user) throw HttpError(401, "User not found");

  if (user.refreshToken !== payload.refreshToken) {
    throw HttpError(401, "Refresh token mismatch");
  }

  const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
    createTokens(user._id, user.username);

  await User.findByIdAndUpdate(user._id, {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });

  const stats = await getUserStats(user._id);

  const userData: LoginResult["user"] = {
    _id: user._id.toString(),
    email: user.email,
    fullName: user.fullName,
    username: user.username,
    ...stats,
  };

  if (user.avatar) userData.avatar = user.avatar;
  if (user.bio) userData.bio = user.bio;
  if (user.website) userData.website = user.website;

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: userData,
  };
};
