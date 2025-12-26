import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../core/database";
import { sendSuccess, sendError } from "../utils/response";
import { Validator } from "../utils/validator";

export const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 7 * 24 * 60 * 60;

export async function register(req: Request, res: Response) {
  const validator = Validator.make(req.body || {}, {
    email: "required|email|unique:users,email",
    name: "required|min:1",
    password: "required|min:4",
    confirmPassword: "required|min:4|same:password",
  });

  if (await validator.fails()) {
    sendError(res, 422, "Validation error", validator.errors());
    return;
  }
  const { email, name, password } = await validator.validated();
  // Manual unique check removed as it is handled by validator
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

  sendSuccess(res, 200, "Registration successful", {
    id: user.id.toString(),
    email: user.email,
    name: user.name,
    role: defaultRole ? defaultRole.slug : "user",
  });
}

export async function login(req: Request, res: Response) {
  const validator = Validator.make(req.body || {}, {
    email: "required|email",
    password: "required|min:4",
  });

  if (await validator.fails()) {
    sendError(res, 422, "Validation error", validator.errors());
    return;
  }
  const { email, password } = await validator.validated();
  const user = await prisma.users.findUnique({
    where: { email },
    include: {
      user_roles: {
        include: {
          role: true,
        },
      },
    },
  });
  if (!user) {
    sendError(res, 401, "Email not registered", {
      field: "email",
      message: "Email is not registered, please register first",
    });
    return;
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    sendError(res, 401, "Invalid credentials", {
      field: "password",
      message: "The password you entered is incorrect",
    });
    return;
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    sendError(res, 500, "Server misconfigured");
    return;
  }
  const primaryUserRole =
    user.user_roles && user.user_roles.length > 0 && user.user_roles[0].role
      ? user.user_roles[0].role.slug
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
  sendSuccess(res, 200, "Login successful", {
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
          role: true,
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
      user.user_roles && user.user_roles.length > 0 && user.user_roles[0].role
        ? user.user_roles[0].role.slug
        : "user",
  });
}

export async function logout(req: Request, res: Response) {
  sendSuccess(res, 200, "Logout successful", null);
}

export async function refreshToken(req: Request, res: Response) {
  const validator = Validator.make(req.body || {}, {
    refreshToken: "required|min:1",
  });
  if (await validator.fails()) {
    sendError(res, 422, "Validation error", validator.errors());
    return;
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    sendError(res, 500, "Server misconfigured");
    return;
  }
  try {
    const validatedData = await validator.validated();
    const decoded = jwt.verify(validatedData.refreshToken, secret) as {
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
            role: true,
          },
        },
      },
    });
    if (!user) {
      sendError(res, 401, "Invalid refresh token");
      return;
    }
    const primaryUserRole =
      user.user_roles && user.user_roles.length > 0 && user.user_roles[0].role
        ? user.user_roles[0].role.slug
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

  const data = {
    avatar: (req as any).file,
  };

  const validator = Validator.make(data, {
    avatar: "nullable|image|mimes:jpeg,png,jpg,gif|max:2048",
  });

  if (await validator.fails()) {
    sendError(res, 422, "Validation error", validator.errors());
    return;
  }

  const { avatar: file } = await validator.validated();

  if (!file) {
    sendError(res, 400, "Avatar file is required");
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
  sendSuccess(res, 200, "Avatar updated successfully", {
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
  const validator = Validator.make(req.body || {}, {
    currentPassword: "required|min:4",
    newPassword: "required|min:4",
    confirmPassword: "required|min:4|same:newPassword",
  });
  if (await validator.fails()) {
    sendError(res, 422, "Validation error", validator.errors());
    return;
  }
  const { currentPassword, newPassword } = await validator.validated();
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
      message: "Current password is incorrect",
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
  sendSuccess(res, 200, "Password updated successfully", null);
}

export async function updateProfile(req: Request, res: Response) {
  const payload = (req as any).user as { userId: string; role: string };
  if (!payload || !payload.userId) {
    sendError(res, 401, "Unauthorized");
    return;
  }
  const validator = Validator.make(req.body || {}, {
    name: "required|min:1",
    email: `required|email|unique:users,email,${payload.userId}`,
  });
  if (await validator.fails()) {
    sendError(res, 422, "Validation error", validator.errors());
    return;
  }
  const { name, email } = await validator.validated();
  const userId = BigInt(payload.userId);
  // Manual unique check removed as it is handled by validator

  const updated = await prisma.users.update({
    where: { id: userId },
    data: {
      name,
      email,
      updated_at: new Date(),
    },
  });
  const { password, remember_token, ...rest } = updated as any;
  sendSuccess(res, 200, "Profile updated successfully", {
    ...rest,
    id: updated.id.toString(),
  });
}
