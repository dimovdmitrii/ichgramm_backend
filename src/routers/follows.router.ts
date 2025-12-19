import { Router } from "express";

import {
  toggleFollowController,
  getFollowersController,
  getFollowingController,
} from "../controllers/follows.controller.js";

import authenticate from "../middlewares/authenticate.js";

const followsRouter: Router = Router();

followsRouter.post("/:username", authenticate, toggleFollowController as any);
followsRouter.delete("/:username", authenticate, toggleFollowController as any);
followsRouter.get("/:username/followers", authenticate, getFollowersController as any);
followsRouter.get("/:username/following", authenticate, getFollowingController as any);

export default followsRouter;


