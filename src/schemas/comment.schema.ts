import * as z from "zod";

export const createCommentSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
  content: z
    .string()
    .min(1, "Content is required")
    .max(500, "Content must not exceed 500 characters"),
});

export type CreateCommentPayload = z.infer<typeof createCommentSchema>;

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(500, "Content must not exceed 500 characters"),
});

export type UpdateCommentPayload = z.infer<typeof updateCommentSchema>;
