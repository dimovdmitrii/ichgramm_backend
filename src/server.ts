import express, { Express } from "express";
import cors from "cors";

import notFoundHandler from "./middlewares/notFoundHandler.js";
import errorHandler from "./middlewares/errorHandler.js";

import authRouter from "./routers/auth.router.js";
import postsRouter from "./routers/post.router.js";
import likesRouter from "./routers/like.router.js";
import commentsRouter from "./routers/comment.router.js";

const startServer = (): void => {
  const app: Express = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api/auth", authRouter);
  app.use("/api/posts", postsRouter);
  app.use("/api/likes", likesRouter);
  app.use("/api/comments", commentsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  const port: number = Number(process.env.PORT) || 3000;
  app.listen(port, () =>
    console.log(`Server successfully running on ${port}, port`),
  );
};

export default startServer;
