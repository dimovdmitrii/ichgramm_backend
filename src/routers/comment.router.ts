import { Router } from "express";

import {
  addCommentController,
  getCommentsByPostController,
  updateCommentController,
  deleteCommentController,
} from "../controllers/comments.controller.js";

import authenticate from "../middlewares/authenticate.js";

const commentsRouter: Router = Router();

commentsRouter.post("/:postId", authenticate, addCommentController as any);
commentsRouter.get(
  "/:postId",
  authenticate,
  getCommentsByPostController as any,
);
commentsRouter.patch("/:id", authenticate, updateCommentController as any);
commentsRouter.delete("/:id", authenticate, deleteCommentController as any);

export default commentsRouter;
