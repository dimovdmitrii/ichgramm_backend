import { Document, CallbackError } from "mongoose";

type MongooserErrorWithStatus = CallbackError & { status?: number };

type MongooseNext = (err?: CallbackError) => void;

export const handleSaveError = (
  error: MongooserErrorWithStatus,
  doc: Document,
  next: MongooseNext,
) => {
  if (error?.name === "ValidationError") {
    error.status = 400;
  }
  if (error?.name === "MongoServerError") {
    error.status = 409;
  }

  next();
};

export const setUpdateSettings = function (this: any, next?: MongooseNext) {
  this.options.new = true;
  this.options.runValidators = true;
  if (next && typeof next === "function") {
    next();
  }
};
