import * as z from "zod";
import {
  passwordRegexp,
  emailRegexp,
  usernameRegexp,
} from "../constants/auth.constants.js";

export const registerSchema = z.object({
  email: z
    .string()
    .min(1)
    .regex(emailRegexp, "Email must contain @ and not contain spaces"),
  fullName: z
    .string()
    .min(3, "Fullname must have at least 3 characters")
    .max(50, "Fullname must not exceed 50 characters"),

  username: z
    .string()
    .min(3, "Username must have at least 3 characters")
    .max(30, "Username must not exceed 30 characters")
    .regex(
      usernameRegexp,
      "Username can only contain letters, numbers, and underscores",
    ),
  password: z
    .string()
    .min(8, "Password must have at least 8 characters")
    .regex(passwordRegexp, "Password must have least 1 letter and 1 number"),
});

export type RegisterPayload = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  username: z
    .string()
    .min(1)
    .refine(
      (value) => {    
        const isEmail = emailRegexp.test(value);
        const isUsername = usernameRegexp.test(value);
        return isEmail || isUsername;
      },
      {
        message: "Must be a valid email or username",
      },
    ),

  password: z
    .string()
    .min(8, "Password must have at least 8 characters")
    .regex(passwordRegexp, "Password must have least 1 letter and 1 number"),
});

export type LoginPayload = z.infer<typeof loginSchema>;

export const resetSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, "Email or username is required")
    .refine(
      (value) => {
        const isEmail = emailRegexp.test(value);
        const isUsername = usernameRegexp.test(value);
        return isEmail || isUsername;
      },
      {
        message: "Must be a valid email or username",
      },
    ),
});
export type ResetPayload = z.infer<typeof resetSchema>;
