import http from "http";
import express, { Express } from "express";
import cors from "cors";
import { WebSocketServer, WebSocket } from "ws";

import notFoundHandler from "./middlewares/notFoundHandler.js";
import errorHandler from "./middlewares/errorHandler.js";

import authRouter from "./routers/auth.router.js";
import postsRouter from "./routers/post.router.js";
import likesRouter from "./routers/like.router.js";
import commentsRouter from "./routers/comment.router.js";
import { verifyAccessToken } from "./utils/jwt.js";
import { getConversation, createMessage } from "./services/messages.services.js";

interface ExtendedWebSocket extends WebSocket {
  userId?: string;
  username?: string;
}

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

  const server = http.createServer(app);

  const wss = new WebSocketServer({ server, path: "/ws/chat" });

  const clients = new Map<string, ExtendedWebSocket>();

  wss.on("connection", async (ws: ExtendedWebSocket, req) => {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    if (!token) {
      ws.close(1008, "Token is required");
      return;
    }

    try {
      const payload = verifyAccessToken(token);
      if (!payload || !payload.id || !payload.username) {
        ws.close(1008, "Invalid token");
        return;
      }

      ws.userId = String(payload.id);
      ws.username = String(payload.username);
      clients.set(ws.userId, ws);

      ws.on("message", async (data) => {
        try {
          const parsed = JSON.parse(data.toString());

          if (parsed.type === "load" && parsed.with && ws.userId) {
            const conversation = await getConversation(ws.userId, parsed.with);
            ws.send(
              JSON.stringify({
                type: "history",
                messages: conversation.map((m) => ({
                  id: m._id,
                  from: (m.sender as any).username,
                  to: (m.recipient as any).username,
                  text: m.text,
                  createdAt: m.createdAt,
                })),
              }),
            );
          }

          if (parsed.type === "message" && ws.userId) {
            const message = await createMessage({
              senderId: ws.userId,
              recipientUsername: parsed.to,
              text: parsed.text,
            });

            const outgoing = {
              type: "message",
              from: (message.sender as any).username,
              to: (message.recipient as any).username,
              text: message.text,
              createdAt: message.createdAt,
            };

            ws.send(JSON.stringify(outgoing));

            const recipientSocket = clients.get(
              String((message.recipient as any)._id),
            );
            if (recipientSocket && recipientSocket.readyState === WebSocket.OPEN) {
              recipientSocket.send(JSON.stringify(outgoing));
            }
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("WebSocket message error:", error);
        }
      });

      ws.on("close", () => {
        if (ws.userId) {
          clients.delete(ws.userId);
        }
      });
    } catch (error) {
      ws.close(1008, "Invalid token");
    }
  });

  server.listen(port, () =>
    // eslint-disable-next-line no-console
    console.log(`Server successfully running on ${port}, port`),
  );
};

export default startServer;
