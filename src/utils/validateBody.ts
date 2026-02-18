import { z } from "zod";

import HttpError from "./HttpError.js";
import { ResponseError } from "../types/interfaces.js";

const validateBody = (schema: z.ZodSchema, body: unknown) => {
  const result = schema.safeParse(body);
  if (!result.success) {
    const issues = result.error.issues;
    const firstError = issues[0];
    const errors: Record<string, string> = {};
    for (const issue of issues) {
      const key = issue.path?.[0];
      if (typeof key === "string" && issue.message) {
        errors[key] = issue.message;
      }
    }
    const err = HttpError(
      400,
      firstError?.message || "Validation error",
    ) as ResponseError;
    if (typeof firstError?.path?.[0] === "string") err.field = firstError.path[0];
    if (Object.keys(errors).length > 0) err.errors = errors;
    throw err;
  }
  return true;
};

export default validateBody;
