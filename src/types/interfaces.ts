import { Request } from "express";

import { UserDocument } from "../db/models/User.js";

export interface ResponseError extends Error {
  status: number;
  field?: string;
}

export interface AuthRequest extends Request {
  user: UserDocument;
}
