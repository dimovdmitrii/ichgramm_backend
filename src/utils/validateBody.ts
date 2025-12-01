import { z } from "zod";

import HttpError from "./HttpError.js";

const validateBody = (schema: z.ZodSchema, body: unknown) => {
  const result = schema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.issues[0];
    if (firstError) {
      throw HttpError(400, firstError.message || "Validation error");
    }
    throw HttpError(400, "Validation error");
  }
  return true;
};

export default validateBody;
