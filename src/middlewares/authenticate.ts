import { RequestHandler } from "express";

import HttpError from "../utils/HttpError.js";

import { findUser, UserFindResult } from "../services/auth.services.js";

import { verifyToken } from "../utils/jwt.js";

const authenticate: RequestHandler = async (req, res, next) => {
  try {
    const authorization = req.get("Authorization");
    if (!authorization) {
      throw HttpError(401, "Authorization header missing");
    }

    const [bearer, token] = authorization.split(" ");
    if (bearer !== "Bearer") {
      throw HttpError(401, "authorization header must have type Bearer");
    }

    if (!token) {
      throw HttpError(401, "authorization header must have token");
    }

    const { data: payload, error } = verifyToken(token);
    if (error && error.message === "jwt expired") {
      throw HttpError(401, "accessToken expired");
    }
    if (error) {
      throw HttpError(401, error.message);
    }
    if (!payload || typeof payload !== "object") {
      throw HttpError(401, "JWT payload not found");
    }
    if (!payload.id) {
      throw HttpError(401, "JWT payload invalid data");
    }

    const user: UserFindResult = await findUser({ _id: payload?.id });
    if (!user) {
      throw HttpError(401, "User not found");
    }

    (req as any).user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
