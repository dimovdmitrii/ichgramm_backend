import { Request, Response, RequestHandler } from "express";

import {
  registerUser,
  loginUser,
  resetUser,
} from "../services/auth.services.js";

import validateBody from "../utils/validateBody.js";

import {
  registerSchema,
  loginSchema,
  resetSchema,
} from "../schemas/auth.schemas.js";

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
  validateBody(loginSchema, req.body);
  const result = await loginUser(req.body);

  res.status(200).json(result);
};

