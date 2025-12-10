import { Types } from "mongoose";
import { generateToken } from "./jwt.js";

const createTokens = (id: Types.ObjectId) => {
  const idString = id.toString();
  const accessToken = generateToken({ id: idString }, { expiresIn: "15m" });
  const refreshToken = generateToken({ id: idString }, { expiresIn: "15d" });
  return { accessToken, refreshToken };
};

export default createTokens;
