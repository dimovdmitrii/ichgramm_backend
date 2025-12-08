import bcrypt from "bcrypt";
import { Types } from "mongoose";
import {
  RegisterPayload,
  LoginPayload,
  ResetPayload,
} from "../schemas/auth.schemas.js";

import HttpError from "../utils/HttpError.js";

import User, { UserDocument } from "../db/models/User.js";

import { generateToken, verifyToken } from "../utils/jwt.js";

export type UserFindResult = UserDocument | null;

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    email: string;
    fullName: string;
    username: string;
  };
}

export const createTokens = (id: Types.ObjectId) => {
  const idString = id.toString();
  const accessToken = generateToken({ id: idString }, { expiresIn: "15m" });
  const refreshToken = generateToken({ id: idString }, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

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

  const { accessToken, refreshToken } = createTokens(user._id);

  await User.findByIdAndUpdate(user._id, { accessToken, refreshToken });

  return {
    accessToken,
    refreshToken,
    user: {
      email: user.email,
      fullName: user.fullName,
      username: user.username,
    },
  };
};

export const refreshUser = async (
  refreshToken: string,
): Promise<LoginResult> => {
  const { data: payload, error } = verifyToken(refreshToken);

  if (error) throw HttpError(401, "Invalid refresh token");
  if (!payload || !payload.id) throw HttpError(401, "Invalid token payload");

  const user: UserFindResult = await findUser({ _id: payload.id });
  if (!user) throw HttpError(401, "User not found");

  if (user.refreshToken !== refreshToken) {
    throw HttpError(401, "Refresh token mismatch");
  }

  const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
    createTokens(user._id);

  await User.findByIdAndUpdate(user._id, {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: {
      email: user.email,
      fullName: user.fullName,
      username: user.username,
    },
  };
};
