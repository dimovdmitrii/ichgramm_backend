import { Router } from "express";

import {
  registerController,
  loginController,
  getCurrentController,
  refreshController,
  logoutController,
} from "../controllers/auth.controllers.js";

import authenticate from "../middlewares/authenticate.js";

const authRouter = Router();

authRouter.post("/register", registerController);

authRouter.post("/login", loginController);

authRouter.post("/refresh", refreshController);

authRouter.post("/logout", authenticate, logoutController);

authRouter.get("/current", authenticate, getCurrentController);

export default authRouter;
