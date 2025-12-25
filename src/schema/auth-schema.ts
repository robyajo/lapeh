import z from "zod";

export const registerSchema = z
  .object({
    email: z
      .string({ required_error: "Email wajib diisi" })
      .email("Format email tidak valid"),
    name: z
      .string({ required_error: "Nama wajib diisi" })
      .min(1, "Nama wajib diisi"),
    password: z
      .string({ required_error: "Password wajib diisi" })
      .min(4, "Password minimal 4 karakter"),
    confirmPassword: z
      .string({ required_error: "Konfirmasi password wajib diisi" })
      .min(4, "Konfirmasi password minimal 4 karakter"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak sama",
  });

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email wajib diisi" })
    .email("Format email tidak valid"),
  password: z
    .string({ required_error: "Password wajib diisi" })
    .min(4, "Password minimal 4 karakter"),
});

export const refreshSchema = z.object({
  refreshToken: z
    .string({ required_error: "Refresh token wajib diisi" })
    .min(1, "Refresh token wajib diisi"),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: "Password saat ini wajib diisi" })
      .min(4, "Password saat ini minimal 4 karakter"),
    newPassword: z
      .string({ required_error: "Password baru wajib diisi" })
      .min(4, "Password baru minimal 4 karakter"),
    confirmPassword: z
      .string({ required_error: "Konfirmasi password wajib diisi" })
      .min(4, "Konfirmasi password minimal 4 karakter"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak sama",
  });

export const updateProfileSchema = z.object({
  name: z
    .string({ required_error: "Nama wajib diisi" })
    .min(1, "Nama wajib diisi"),
  email: z
    .string({ required_error: "Email wajib diisi" })
    .email("Format email tidak valid"),
});
