import * as z from "zod";

export const createLikeSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
});

export type CreateLikePayload = z.infer<typeof createLikeSchema>;
