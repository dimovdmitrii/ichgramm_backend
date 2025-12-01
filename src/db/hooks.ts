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
  if ((error as any).code === 11000) {
    const field = Object.keys((error as any).keyPattern || {})[0];

    if (field === "email") {
      error.message = "Email already exist";
    } else if (field === "username") {
      error.message = "Username already exist";
    } else {
      error.message = `${field} already exist`;
    }
  }

  next(error);
};

export const setUpdateSettings = function (this: any, next: MongooseNext) {
  this.options.new = true;
  this.options.runValidators = true;
  next();
};
