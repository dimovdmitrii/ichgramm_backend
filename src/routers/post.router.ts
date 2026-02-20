import { Router } from "express";

import {
  getPostsController,
  getPostByIdController,
  addPostController,
  updatePostController,
  deletePostController,
} from "../controllers/posts.controller.js";

import authenticate from "../middlewares/authenticate.js";
import uploadPostImage from "../middlewares/uploadPostImage.js";

const postsRouter: Router = Router();

postsRouter.get("/", authenticate, getPostsController as any);
postsRouter.get("/:id", authenticate, getPostByIdController as any);
postsRouter.post(
  "/",
  authenticate,
  uploadPostImage.single("image"),
  addPostController as any
);
postsRouter.patch(
  "/:id",
  authenticate,
  uploadPostImage.single("image"),
  updatePostController as any
);
postsRouter.delete("/:id", authenticate, deletePostController as any);

export default postsRouter;
