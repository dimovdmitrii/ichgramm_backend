import { Router } from "express";

import {
  toggleLikeController,
  getLikesByPostController,
  getUserLikesController,
} from "../controllers/likes.controller.js";

import authenticate from "../middlewares/authenticate.js";

const likesRouter: Router = Router();

likesRouter.post("/:postId", authenticate, toggleLikeController as any);
likesRouter.get("/post/:postId", authenticate, getLikesByPostController as any);
likesRouter.get("/user", authenticate, getUserLikesController as any);

export default likesRouter;

