import { Router } from "express";

import {
  getPostsController,
  getPostByIdController,
  addPostController,
  updatePostController,
  deletePostController,
} from "../controllers/posts.controller.js";

import authenticate from "../middlewares/authenticate.js";

const postsRouter: Router = Router();

postsRouter.get("/", authenticate, getPostsController as any);
postsRouter.get("/:id", authenticate, getPostByIdController as any);
postsRouter.post("/", authenticate, addPostController as any);
postsRouter.patch("/:id", authenticate, updatePostController as any);
postsRouter.delete("/:id", authenticate, deletePostController as any);

export default postsRouter;
