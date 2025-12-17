import { Router } from "express";

import {
  getProfileController,
  getProfileByUsernameController,
  updateProfileController,
} from "../controllers/users.controller.js";

import authenticate from "../middlewares/authenticate.js";

const usersRouter: Router = Router();

usersRouter.get("/profile", authenticate, getProfileController as any);
usersRouter.get("/profile/:username", authenticate, getProfileByUsernameController as any);
usersRouter.patch("/profile", authenticate, updateProfileController as any);

export default usersRouter;

