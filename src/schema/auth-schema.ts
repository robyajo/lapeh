import z from "zod";

export const registerSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format"),
    name: z
      .string({ required_error: "Name is required" })
      .min(1, "Name is required"),
    password: z
      .string({ required_error: "Password is required" })
      .min(4, "Password must be at least 4 characters"),
    confirmPassword: z
      .string({ required_error: "Confirm password is required" })
      .min(4, "Confirm password must be at least 4 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Confirm password does not match",
  });

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format"),
  password: z
    .string({ required_error: "Password is required" })
    .min(4, "Password must be at least 4 characters"),
});

export const refreshSchema = z.object({
  refreshToken: z
    .string({ required_error: "Refresh token is required" })
    .min(1, "Refresh token is required"),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: "Current password is required" })
      .min(4, "Current password must be at least 4 characters"),
    newPassword: z
      .string({ required_error: "New password is required" })
      .min(4, "New password must be at least 4 characters"),
    confirmPassword: z
      .string({ required_error: "Confirm password is required" })
      .min(4, "Confirm password must be at least 4 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Confirm password does not match",
  });

export const updateProfileSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required"),
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format"),
});
