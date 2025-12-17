import { UserDocument } from "../db/models/User.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: UserDocument;
  }
}
