import { Request, Response, RequestHandler } from "express";

import {
  registerUser,
  loginUser,
  refreshUser,
} from "../services/auth.services.js";

import validateBody from "../utils/validateBody.js";

import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from "../schemas/auth.schemas.js";

import createTokens from "../utils/createTokens.js";

import { AuthRequest } from "../types/interfaces.js";

import User from "../db/models/User.js";
import { getUserStats } from "../services/users.services.js";

export const registerController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  validateBody(registerSchema, req.body);
  await registerUser(req.body);

  res.status(201).json({
    message: "User register successfully",
  });
};

export const loginController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const normalizedBody = {
    username: req.body.email || req.body.username,
    password: req.body.password,
  };

  validateBody(loginSchema, normalizedBody);
  const result = await loginUser(normalizedBody);

  res.status(200).json(result);
};

export const getCurrentController: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;
  const { accessToken, refreshToken } = createTokens(
    authReq.user._id,
    authReq.user.username,
  );

  await User.findByIdAndUpdate(authReq.user._id, { accessToken, refreshToken });

  const stats = await getUserStats(authReq.user._id);

  const userData: {
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
  } = {
    _id: authReq.user._id.toString(),
    email: authReq.user.email,
    fullName: authReq.user.fullName,
    username: authReq.user.username,
    ...stats,
  };

  if (authReq.user.avatar) userData.avatar = authReq.user.avatar;
  if (authReq.user.bio) userData.bio = authReq.user.bio;
  if (authReq.user.website) userData.website = authReq.user.website;

  res.json({
    accessToken,
    refreshToken,
    user: userData,
  });
};

export const refreshController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  validateBody(refreshSchema, req.body);
  const result = await refreshUser(req.body);

  res.status(200).json(result);
};

export const logoutController: RequestHandler = async (req, res) => {
  const authReq = req as AuthRequest;

  if (authReq.user?._id) {
    await User.findByIdAndUpdate(authReq.user._id, {
      accessToken: null,
      refreshToken: null,
    });
  }

  res.status(204).send();
};
