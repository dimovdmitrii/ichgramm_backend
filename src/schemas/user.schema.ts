import * as z from "zod";
import { usernameRegexp } from "../constants/auth.constants.js";

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must have at least 3 characters")
    .max(30, "Username must not exceed 30 characters")
    .regex(
      usernameRegexp,
      "Username can only contain letters, numbers, and underscores",
    )
    .optional(),
  fullName: z
    .string()
    .min(3, "Fullname must have at least 3 characters")
    .max(50, "Fullname must not exceed 50 characters")
    .optional(),
  bio: z
    .string()
    .max(200, "Bio must not exceed 200 characters")
    .optional(),
  website: z
    .string()
    .max(200, "Website must not exceed 200 characters")
    .url("Website must be a valid URL")
    .optional()
    .or(z.literal("")),
  avatar: z.string().url("Avatar must be a valid URL").optional().or(z.literal("")),
});

export type UpdateProfilePayload = z.infer<typeof updateProfileSchema>;

