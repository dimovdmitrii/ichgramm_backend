import { Router } from "express";

import {
  getProfileController,
  getProfileByUsernameController,
  updateProfileController,
  searchUsersController,
} from "../controllers/users.controller.js";

import authenticate from "../middlewares/authenticate.js";

const usersRouter: Router = Router();

usersRouter.get("/profile", authenticate, getProfileController as any);
usersRouter.get("/profile/:username", authenticate, getProfileByUsernameController as any);
usersRouter.patch("/profile", authenticate, updateProfileController as any);
usersRouter.get("/search", authenticate, searchUsersController as any);

export default usersRouter;

