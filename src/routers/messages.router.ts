import { Router } from "express";
import  authenticate  from "../middlewares/authenticate.js";
import { getConversation, createMessage } from "../services/messages.services.js";
import  HttpError  from "../utils/HttpError.js";

const messagesRouter = Router();

// Получить историю переписки с пользователем
messagesRouter.get(
  "/conversation/:username",
  authenticate,
  async (req, res, next) => {
    try {
      const userId = req.user?._id?.toString();
      const otherUsername = req.params.username;

      if (!userId) {
        throw HttpError(401, "Unauthorized");
      }
      if (!otherUsername) {
        throw HttpError(400, "Username is required");
      }

      const messages = await getConversation(userId, otherUsername);

      res.json(
        messages.map((m) => ({
          id: m._id.toString(),
          from: (m.sender as any).username,
          fromId: (m.sender as any)._id.toString(),
          fromAvatar: (m.sender as any).avatar,
          to: (m.recipient as any).username,
          toId: (m.recipient as any)._id.toString(),
          toAvatar: (m.recipient as any).avatar,
          text: m.text,
          createdAt: m.createdAt,
        }))
      );
    } catch (error) {
      next(error);
    }
  }
);

// Получить список всех чатов (последние сообщения с каждым пользователем)
messagesRouter.get("/chats", authenticate, async (req, res, next) => {
  try {
    const userId = req.user?._id?.toString();

    if (!userId) {
      throw HttpError(401, "Unauthorized");
    }

    // Получаем все сообщения, где пользователь является отправителем или получателем
    const Message = (await import("../db/models/Message.js")).default;
    const User = (await import("../db/models/User.js")).default;

    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "username avatar")
      .populate("recipient", "username avatar")
      .exec();

    // Группируем по собеседникам и берем последнее сообщение
    const chatMap = new Map();

    messages.forEach((m) => {
      const senderId = (m.sender as any)._id.toString();
      const recipientId = (m.recipient as any)._id.toString();
      const otherUserId = senderId === userId ? recipientId : senderId;
      const otherUser = senderId === userId ? m.recipient : m.sender;

      if (!chatMap.has(otherUserId)) {
        chatMap.set(otherUserId, {
          userId: otherUserId,
          username: (otherUser as any).username,
          avatar: (otherUser as any).avatar,
          lastMessage: m.text,
          lastMessageTime: m.createdAt,
          unreadCount: 0, // Можно добавить логику подсчета непрочитанных
        });
      }
    });

    const chats = Array.from(chatMap.values()).sort(
      (a, b) =>
        new Date(b.lastMessageTime).getTime() -
        new Date(a.lastMessageTime).getTime()
    );

    res.json(chats);
  } catch (error) {
    next(error);
  }
});

export default messagesRouter;


