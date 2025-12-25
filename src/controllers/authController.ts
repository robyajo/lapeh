import { Request, Response } from "express";
import { prisma } from "../prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { sendSuccess, sendError } from "../utils/response";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  updatePasswordSchema,
  updateProfileSchema,
} from "../schema/auth-schema";

export const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 7 * 24 * 60 * 60;

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    sendError(res, 422, "Validation error", errors);
    return;
  }
  const { email, name, password } = parsed.data;
  const existing = await prisma.users.findUnique({ where: { email } });
  if (existing) {
    sendError(res, 409, "Email already used", {
      field: "email",
      message: "Email sudah terdaftar, silakan gunakan email lain",
    });
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.users.create({
    data: {
      email,
      name,
      password: hash,
      uuid: uuidv4(),
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  const defaultRole = await prisma.roles.findUnique({
    where: { slug: "user" },
  });
  if (defaultRole) {
    await prisma.user_roles.create({
      data: {
        user_id: user.id,
        role_id: defaultRole.id,
        created_at: new Date(),
      },
    });
  }

  sendSuccess(res, 200, "Registrasi berhasil", {
    id: user.id.toString(),
    email: user.email,
    name: user.name,
    role: defaultRole ? defaultRole.slug : "user",
  });
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    sendError(res, 422, "Validation error", errors);
    return;
  }
  const { email, password } = parsed.data;
  const user = await prisma.users.findUnique({
    where: { email },
    include: {
      user_roles: {
        include: {
          roles: true,
        },
      },
    },
  });
  if (!user) {
    sendError(res, 401, "Email not registered", {
      field: "email",
      message: "Email belum terdaftar, silakan registrasi terlebih dahulu",
    });
    return;
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    sendError(res, 401, "Invalid credentials", {
      field: "password",
      message: "Password yang Anda masukkan salah",
    });
    return;
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    sendError(res, 500, "Server misconfigured");
    return;
  }
  const primaryUserRole =
    user.user_roles && user.user_roles.length > 0 && user.user_roles[0].roles
      ? user.user_roles[0].roles.slug
      : "user";
  const accessExpiresInSeconds = ACCESS_TOKEN_EXPIRES_IN_SECONDS;
  const accessExpiresAt = new Date(
    Date.now() + accessExpiresInSeconds * 1000
  ).toISOString();
  const token = jwt.sign(
    { userId: user.id.toString(), role: primaryUserRole },
    secret,
    { expiresIn: accessExpiresInSeconds }
  );
  const refreshExpiresInSeconds = 30 * 24 * 60 * 60;
  const refreshToken = jwt.sign(
    {
      userId: user.id.toString(),
      role: primaryUserRole,
      tokenType: "refresh",
    },
    secret,
    { expiresIn: refreshExpiresInSeconds }
  );
  sendSuccess(res, 200, "Login berhasil", {
    token,
    refreshToken,
    expiresIn: accessExpiresInSeconds,
    expiresAt: accessExpiresAt,
    name: user.name,
    role: primaryUserRole,
  });
}

export async function me(req: Request, res: Response) {
  const payload = (req as any).user as { userId: string; role: string };
  if (!payload || !payload.userId) {
    sendError(res, 401, "Unauthorized");
    return;
  }
  const user = await prisma.users.findUnique({
    where: { id: BigInt(payload.userId) },
    include: {
      user_roles: {
        include: {
          roles: true,
        },
      },
    },
  });
  if (!user) {
    sendError(res, 404, "User not found");
    return;
  }
  const { password, remember_token, ...rest } = user as any;
  sendSuccess(res, 200, "User profile", {
    ...rest,
    id: user.id.toString(),
    role:
      user.user_roles && user.user_roles.length > 0 && user.user_roles[0].roles
        ? user.user_roles[0].roles.slug
        : "user",
  });
}

export async function logout(req: Request, res: Response) {
  sendSuccess(res, 200, "Logout berhasil", null);
}

export async function refreshToken(req: Request, res: Response) {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    sendError(res, 422, "Validation error", errors);
    return;
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    sendError(res, 500, "Server misconfigured");
    return;
  }
  try {
    const decoded = jwt.verify(parsed.data.refreshToken, secret) as {
      userId: string;
      role: string;
      tokenType?: string;
      iat: number;
      exp: number;
    };
    if (decoded.tokenType !== "refresh") {
      sendError(res, 401, "Invalid refresh token");
      return;
    }
    const user = await prisma.users.findUnique({
      where: { id: BigInt(decoded.userId) },
      include: {
        user_roles: {
          include: {
            roles: true,
          },
        },
      },
    });
    if (!user) {
      sendError(res, 401, "Invalid refresh token");
      return;
    }
    const primaryUserRole =
      user.user_roles && user.user_roles.length > 0 && user.user_roles[0].roles
        ? user.user_roles[0].roles.slug
        : "user";
    const accessExpiresInSeconds = ACCESS_TOKEN_EXPIRES_IN_SECONDS;
    const accessExpiresAt = new Date(
      Date.now() + accessExpiresInSeconds * 1000
    ).toISOString();
    const token = jwt.sign(
      { userId: user.id.toString(), role: primaryUserRole },
      secret,
      { expiresIn: accessExpiresInSeconds }
    );
    sendSuccess(res, 200, "Token refreshed", {
      token,
      expiresIn: accessExpiresInSeconds,
      expiresAt: accessExpiresAt,
      name: user.name,
      role: primaryUserRole,
    });
  } catch {
    sendError(res, 401, "Invalid refresh token");
  }
}

export async function updateAvatar(req: Request, res: Response) {
  const payload = (req as any).user as { userId: string; role: string };
  if (!payload || !payload.userId) {
    sendError(res, 401, "Unauthorized");
    return;
  }
  const file = (req as any).file as {
    filename: string;
    path: string;
  } | null;
  if (!file) {
    sendError(res, 400, "Avatar file wajib diupload");
    return;
  }
  const userId = BigInt(payload.userId);
  const avatar = file.filename;
  const avatar_url =
    process.env.AVATAR_BASE_URL || `/uploads/avatars/${file.filename}`;
  const updated = await prisma.users.update({
    where: { id: userId },
    data: {
      avatar,
      avatar_url,
      updated_at: new Date(),
    },
  });
  const { password, remember_token, ...rest } = updated as any;
  sendSuccess(res, 200, "Avatar berhasil diperbarui", {
    ...rest,
    id: updated.id.toString(),
  });
}

export async function updatePassword(req: Request, res: Response) {
  const payload = (req as any).user as { userId: string; role: string };
  if (!payload || !payload.userId) {
    sendError(res, 401, "Unauthorized");
    return;
  }
  const parsed = updatePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    sendError(res, 422, "Validation error", errors);
    return;
  }
  const { currentPassword, newPassword } = parsed.data;
  const user = await prisma.users.findUnique({
    where: { id: BigInt(payload.userId) },
  });
  if (!user) {
    sendError(res, 404, "User not found");
    return;
  }
  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) {
    sendError(res, 401, "Invalid credentials", {
      field: "currentPassword",
      message: "Password saat ini tidak sesuai",
    });
    return;
  }
  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.users.update({
    where: { id: user.id },
    data: {
      password: hash,
      updated_at: new Date(),
    },
  });
  sendSuccess(res, 200, "Password berhasil diperbarui", null);
}

export async function updateProfile(req: Request, res: Response) {
  const payload = (req as any).user as { userId: string; role: string };
  if (!payload || !payload.userId) {
    sendError(res, 401, "Unauthorized");
    return;
  }
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    sendError(res, 422, "Validation error", errors);
    return;
  }
  const { name, email } = parsed.data;
  const userId = BigInt(payload.userId);
  const existing = await prisma.users.findFirst({
    where: {
      email,
      NOT: { id: userId },
    },
  });
  if (existing) {
    sendError(res, 409, "Email already used", {
      field: "email",
      message: "Email sudah terdaftar, silakan gunakan email lain",
    });
    return;
  }
  const updated = await prisma.users.update({
    where: { id: userId },
    data: {
      name,
      email,
      updated_at: new Date(),
    },
  });
  const { password, remember_token, ...rest } = updated as any;
  sendSuccess(res, 200, "Profil berhasil diperbarui", {
    ...rest,
    id: updated.id.toString(),
  });
}
