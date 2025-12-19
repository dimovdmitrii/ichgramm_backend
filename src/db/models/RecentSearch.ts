import { Schema, model, Document, Types } from "mongoose";

import { handleSaveError, setUpdateSettings } from "../hooks.js";

export interface RecentSearchDocument extends Document {
  user: Types.ObjectId;
  searchedUser: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RecentSearchSchema = new Schema<RecentSearchDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    searchedUser: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Уникальный индекс: один пользователь не может иметь дубликат одного и того же поиска
RecentSearchSchema.index({ user: 1, searchedUser: 1 }, { unique: true });

// Предотвращение сохранения поиска самого себя
RecentSearchSchema.pre("save", function (this: any, next: any) {
  if (typeof next !== "function") {
    return;
  }
  if (this.user && this.searchedUser && this.user.toString() === this.searchedUser.toString()) {
    const error = new Error("Cannot search yourself");
    return next(error);
  }
  next();
});

RecentSearchSchema.post("save", handleSaveError);
RecentSearchSchema.pre("findOneAndUpdate" as any, setUpdateSettings);
RecentSearchSchema.post("findOneAndUpdate" as any, handleSaveError);

const RecentSearch = model<RecentSearchDocument>("RecentSearch", RecentSearchSchema);

export default RecentSearch;

