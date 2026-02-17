import { Request, Response, NextFunction } from "express";

import { ResponseError } from "../types/interfaces.js";

const errorHandler = (
  error: ResponseError,
  _: Request,
  res: Response,
  __: NextFunction,
): void => {
  const { status = 500, message = "server error", field } = error;
  const body: { message: string; field?: string } = { message };
  if (field) body.field = field;
  res.status(status).json(body);
};

export default errorHandler;
