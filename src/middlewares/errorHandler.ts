import { Request, Response, NextFunction } from "express";

import { ResponseError } from "../types/interfaces.js";

const errorHandler = (
  error: ResponseError,
  _: Request,
  res: Response,
  __: NextFunction,
): void => {
  const { status = 500, message = "server error", field, errors } = error;
  const body: { message: string; field?: string; errors?: Record<string, string> } = { message };
  if (field) body.field = field;
  if (errors) body.errors = errors;
  res.status(status).json(body);
};

export default errorHandler;
