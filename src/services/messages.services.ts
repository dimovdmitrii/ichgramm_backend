import Message, { MessageDocument } from "../db/models/Message.js";
import User from "../db/models/User.js";

export const getConversation = async (
  userId: string,
  otherUsername: string,
): Promise<MessageDocument[]> => {
  const otherUser = await User.findOne({ username: otherUsername });

  if (!otherUser) {
    return [];
  }

  return Message.find({
    $or: [
      { sender: userId, recipient: otherUser._id },
      { sender: otherUser._id, recipient: userId },
    ],
  })
    .sort({ createdAt: 1 })
    .populate("sender", "username")
    .populate("recipient", "username")
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
  const recipient = await User.findOne({ username: recipientUsername });

  if (!recipient) {
    throw new Error("Recipient not found");
  }

  const message = await Message.create({
    sender: senderId,
    recipient: recipient._id,
    text,
  });

  await message.populate("sender", "username");
  await message.populate("recipient", "username");
  return message;
};


