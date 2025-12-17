import { Schema, model, Document, Types } from "mongoose";

import { handleSaveError, setUpdateSettings } from "../hooks.js";

export interface MessageDocument extends Document {
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<MessageDocument>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  },
);

MessageSchema.post("save", handleSaveError);
MessageSchema.pre("findOneAndUpdate" as any, setUpdateSettings);
MessageSchema.post("findOneAndUpdate" as any, handleSaveError);

const Message = model<MessageDocument>("Message", MessageSchema);

export default Message;
