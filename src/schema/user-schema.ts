import z from "zod";

export const createUserSchema = z
  .object({
    email: z
      .string({ required_error: "Email wajib diisi" })
      .email("Format email tidak valid"),
    name: z
      .string({ required_error: "Nama wajib diisi" })
      .min(1, "Nama wajib diisi"),
    password: z
      .string({ required_error: "Password wajib diisi" })
      .min(6, "Password minimal 6 karakter"),
    confirmPassword: z
      .string({ required_error: "Konfirmasi password wajib diisi" })
      .min(4, "Konfirmasi password minimal 4 karakter"),
    roleId: z.string().optional(),
    permissionIds: z.array(z.string()).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak sama",
  });

export const updateUserSchema = z
  .object({
    email: z
      .string({ required_error: "Email wajib diisi" })
      .email("Format email tidak valid")
      .optional(),
    name: z
      .string({ required_error: "Nama wajib diisi" })
      .min(1, "Nama wajib diisi")
      .optional(),
    password: z
      .string({ required_error: "Password wajib diisi" })
      .min(6, "Password minimal 6 karakter")
      .optional(),
    confirmPassword: z
      .string({ required_error: "Konfirmasi password wajib diisi" })
      .min(4, "Konfirmasi password minimal 4 karakter")
      .optional(),
    roleId: z.string().optional(),
    permissionIds: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (!data.password) {
        return true;
      }
      return data.password === data.confirmPassword;
    },
    {
      path: ["confirmPassword"],
      message: "Konfirmasi password tidak sama",
    }
  );
