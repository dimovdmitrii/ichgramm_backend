import * as z from "zod";

export const createPostSchema = z.object({
  image: z.string().min(1, "Image is required"),
  content: z
    .string()
    .min(1, "Content is required")
    .max(500, "Content must not exceed 500 characters"),
});

export type CreatePostPayload = z.infer<typeof createPostSchema>;

export const updatePostSchema = z.object({
  image: z.string().min(1, "Image is required").optional(),
  content: z
    .string()
    .min(1, "Content is required")
    .max(500, "Content must not exceed 500 characters")
    .optional(),
});

export type UpdatePostPayload = z.infer<typeof updatePostSchema>;
