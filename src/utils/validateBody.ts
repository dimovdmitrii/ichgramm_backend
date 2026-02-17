import { z } from "zod";

import HttpError from "./HttpError.js";
import { ResponseError } from "../types/interfaces.js";

const validateBody = (schema: z.ZodSchema, body: unknown) => {
  const result = schema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.issues[0];
    if (firstError) {
      const err = HttpError(400, firstError.message || "Validation error") as ResponseError;
      const field = firstError.path?.[0];
      if (typeof field === "string") err.field = field;
      throw err;
    }
    throw HttpError(400, "Validation error");
  }
  return true;
};

export default validateBody;
