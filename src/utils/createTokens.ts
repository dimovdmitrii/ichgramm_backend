import { Types } from "mongoose";
import { generateToken } from "./jwt.js";

const createTokens = (id: Types.ObjectId, username?: string) => {
  const idString = id.toString();
  const payload: { id: string; username?: string } = { id: idString };
  if (username) {
    payload.username = username;
  }
  const accessToken = generateToken(payload, { expiresIn: "15m" });
  const refreshToken = generateToken(payload, { expiresIn: "15d" });
  return { accessToken, refreshToken };
};

export default createTokens;
