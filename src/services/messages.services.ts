import { Types } from "mongoose";
import Message, { MessageDocument } from "../db/models/Message.js";
import User from "../db/models/User.js";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const getConversation = async (
  userId: string,
  otherUsername: string,
): Promise<MessageDocument[]> => {
  if (!otherUsername?.trim()) return [];

  const otherUser = await User.findOne({
    username: new RegExp(`^${escapeRegex(otherUsername.trim())}$`, "i"),
  });

  if (!otherUser) {
    return [];
  }

  const currentUserId = new Types.ObjectId(userId);
  const otherUserId = otherUser._id;

  return Message.find({
    $or: [
      { sender: currentUserId, recipient: otherUserId },
      { sender: otherUserId, recipient: currentUserId },
    ],
  })
    .sort({ createdAt: 1 })
    .populate("sender", "username avatar")
    .populate("recipient", "username avatar")
    .exec();
};

export const createMessage = async ({
  senderId,
  recipientUsername,
  text,
}: {
  senderId: string;
  recipientUsername: string;
  text: string;
}): Promise<MessageDocument> => {
  const recipient = await User.findOne({
    username: new RegExp(`^${escapeRegex(recipientUsername.trim())}$`, "i"),
  });

  if (!recipient) {
    throw new Error("Recipient not found");
  }

  const message = await Message.create({
    sender: senderId,
    recipient: recipient._id,
    text,
  });

  await message.populate("sender", "username avatar");
  await message.populate("recipient", "username avatar");
  return message;
};


