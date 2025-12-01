import { Request, Response } from "express";

import { registerUser } from "../services/auth.services.js";

import validateBody from "../utils/validateBody.js";

import { registerSchema } from "../schemas/auth.schemas.js";

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
