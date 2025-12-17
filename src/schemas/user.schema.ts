import * as z from "zod";

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(3, "Fullname must have at least 3 characters")
    .max(50, "Fullname must not exceed 50 characters")
    .optional(),
  bio: z
    .string()
    .max(200, "Bio must not exceed 200 characters")
    .optional(),
  avatar: z.string().url("Avatar must be a valid URL").optional().or(z.literal("")),
});

export type UpdateProfilePayload = z.infer<typeof updateProfileSchema>;

