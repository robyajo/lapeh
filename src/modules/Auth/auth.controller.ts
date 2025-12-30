import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { sendError, sendFastSuccess } from "@lapeh/utils/response";
import { Validator } from "@lapeh/utils/validator";
import { getSerializer, createResponseSchema } from "@lapeh/core/serializer";
import { users, roles, user_roles, saveStore } from "@lapeh/core/store";
import { redis } from "@lapeh/core/redis";

export const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 7 * 24 * 60 * 60;

// --- Serializers ---

const registerSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    email: { type: "string" },
    name: { type: "string" },
    role: { type: "string" },
  },
};

const loginSchema = {
  type: "object",
  properties: {
    token: { type: "string" },
    refreshToken: { type: "string" },
    expiresIn: { type: "integer" },
    expiresAt: { type: "string" },
    name: { type: "string" },
    role: { type: "string" },
  },
};

const userProfileSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    email: { type: "string" },
    role: { type: "string" },
    avatar: { type: "string", nullable: true },
    avatar_url: { type: "string", nullable: true },
    email_verified_at: { type: "string", format: "date-time", nullable: true },
    created_at: { type: "string", format: "date-time", nullable: true },
    updated_at: { type: "string", format: "date-time", nullable: true },
  },
};

const refreshTokenSchema = {
  type: "object",
  properties: {
    token: { type: "string" },
    expiresIn: { type: "integer" },
    expiresAt: { type: "string" },
    name: { type: "string" },
    role: { type: "string" },
  },
};

const registerSerializer = getSerializer(
  "auth-register",
  createResponseSchema(registerSchema)
);
const loginSerializer = getSerializer(
  "auth-login",
  createResponseSchema(loginSchema)
);
const userProfileSerializer = getSerializer(
  "auth-profile",
  createResponseSchema(userProfileSchema)
);
const refreshTokenSerializer = getSerializer(
  "auth-refresh",
  createResponseSchema(refreshTokenSchema)
);

const voidSerializer = getSerializer(
  "void",
  createResponseSchema({ type: "null" })
);

// --- Controllers ---

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

  // Manual unique check (In-Memory)
  if (users.find((u) => u.email === email)) {
    sendError(res, 422, "Validation error", { email: "Email already taken" });
    return;
  }

  const hash = await bcrypt.hash(password, 10);

  const newUser = {
    id: (users.length + 1).toString(), // Simple ID generation
    email,
    name,
    password: hash,
    uuid: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
    avatar: null,
    avatar_url: null,
    email_verified_at: null,
    remember_token: null,
  };
  users.push(newUser);

  const defaultRole = roles.find((r) => r.slug === "user");
  if (defaultRole) {
    user_roles.push({
      id: (user_roles.length + 1).toString(),
      user_id: newUser.id,
      role_id: defaultRole.id,
      created_at: new Date(),
    });
  }
  saveStore();

  sendFastSuccess(res, 201, registerSerializer, {
    status: "success",
    message: "Registration successful. You can now login.",
    data: {
      id: newUser.id.toString(),
      email: newUser.email,
      name: newUser.name,
      role: defaultRole ? defaultRole.slug : "user",
    },
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

  const user = users.find((u) => u.email === email);

  if (!user) {
    sendError(res, 401, "Email not registered", {
      field: "email",
      message: "Email is not registered, please register first",
    });
    return;
  }
  const ok = await bcrypt.compare(password, user.password || "");
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

  // Find user roles
  const userRoleLinks = user_roles.filter((ur) => ur.user_id === user.id);
  const userRoleObjects = userRoleLinks
    .map((ur) => roles.find((r) => r.id === ur.role_id))
    .filter((r) => r);

  const primaryUserRole =
    userRoleObjects.length > 0 && userRoleObjects[0]
      ? userRoleObjects[0].slug
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
  sendFastSuccess(res, 200, loginSerializer, {
    status: "success",
    message: "Login successful",
    data: {
      token,
      refreshToken,
      expiresIn: accessExpiresInSeconds,
      expiresAt: accessExpiresAt,
      name: user.name,
      role: primaryUserRole,
    },
  });
}

export async function me(req: Request, res: Response) {
  const payload = (req as any).user as { userId: string; role: string };
  if (!payload || !payload.userId) {
    sendError(res, 401, "Unauthorized");
    return;
  }

  // Try to get from Redis
  const cachedUser = await redis.get(`user:${payload.userId}`);
  if (cachedUser) {
    const user = JSON.parse(cachedUser);
    sendFastSuccess(res, 200, userProfileSerializer, {
      status: "success",
      message: "User profile (cached)",
      data: user,
    });
    return;
  }

  const user = users.find((u) => u.id === payload.userId);

  if (!user) {
    sendError(res, 404, "User not found");
    return;
  }

  // Find user roles
  const userRoleLinks = user_roles.filter((ur) => ur.user_id === user.id);
  const userRoleObjects = userRoleLinks
    .map((ur) => roles.find((r) => r.id === ur.role_id))
    .filter((r) => r);

  const primaryRoleSlug =
    userRoleObjects.length > 0 ? userRoleObjects[0]?.slug : "user";

  const { password, ...rest } = user;
  const userData = {
    ...rest,
    id: user.id.toString(),
    role: primaryRoleSlug,
  };

  // Cache in Redis for 1 hour
  await redis.set(
    `user:${payload.userId}`,
    JSON.stringify(userData),
    "EX",
    3600
  );

  sendFastSuccess(res, 200, userProfileSerializer, {
    status: "success",
    message: "User profile",
    data: userData,
  });
}

export async function logout(_req: Request, res: Response) {
  // In a stateless JWT setup, logout is client-side (delete token).
  // If using a whitelist/blacklist in Redis, invalidate the token here.
  // For now, just return success.
  sendFastSuccess(res, 200, voidSerializer, {
    status: "success",
    message: "Logout successful",
    data: null,
  });
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

    const user = users.find((u) => u.id === decoded.userId);

    if (!user) {
      sendError(res, 401, "Invalid refresh token");
      return;
    }

    // Find user roles
    const userRoleLinks = user_roles.filter((ur) => ur.user_id === user.id);
    const userRoleObjects = userRoleLinks
      .map((ur) => roles.find((r) => r.id === ur.role_id))
      .filter((r) => r);

    const primaryUserRole =
      userRoleObjects.length > 0 && userRoleObjects[0]
        ? userRoleObjects[0].slug
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
    sendFastSuccess(res, 200, refreshTokenSerializer, {
      status: "success",
      message: "Token refreshed",
      data: {
        token,
        expiresIn: accessExpiresInSeconds,
        expiresAt: accessExpiresAt,
        name: user.name,
        role: primaryUserRole,
      },
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
  const userId = payload.userId;
  const avatar = file.filename;
  const avatar_url =
    process.env.AVATAR_BASE_URL || `/uploads/avatars/${file.filename}`;

  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    sendError(res, 404, "User not found");
    return;
  }

  users[userIndex] = {
    ...users[userIndex],
    avatar,
    avatar_url,
    updated_at: new Date(),
  };

  const updated = users[userIndex];
  const { password, ...rest } = updated;

  sendFastSuccess(res, 200, userProfileSerializer, {
    status: "success",
    message: "Avatar updated successfully",
    data: {
      ...rest,
      id: updated.id.toString(),
      role: payload.role, // Use role from JWT payload as it shouldn't change here
    },
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

  const userIndex = users.findIndex((u) => u.id === payload.userId);
  if (userIndex === -1) {
    sendError(res, 404, "User not found");
    return;
  }

  const user = users[userIndex];
  const ok = await bcrypt.compare(currentPassword, user.password || "");
  if (!ok) {
    sendError(res, 401, "Invalid credentials", {
      field: "currentPassword",
      message: "Current password is incorrect",
    });
    return;
  }
  const hash = await bcrypt.hash(newPassword, 10);

  users[userIndex] = {
    ...user,
    password: hash,
    updated_at: new Date(),
  };

  sendFastSuccess(res, 200, voidSerializer, {
    status: "success",
    message: "Password updated successfully",
    data: null,
  });
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
  const userId = payload.userId;

  // Manual unique check (In-Memory)
  if (users.find((u) => u.email === email && u.id !== userId)) {
    sendError(res, 422, "Validation error", { email: "Email already taken" });
    return;
  }

  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    sendError(res, 404, "User not found");
    return;
  }

  users[userIndex] = {
    ...users[userIndex],
    name,
    email,
    updated_at: new Date(),
  };
  saveStore();
  await redis.del(`user:${userId}`);

  const updated = users[userIndex];
  const { password, ...rest } = updated;

  sendFastSuccess(res, 200, userProfileSerializer, {
    status: "success",
    message: "Profile updated successfully",
    data: {
      ...rest,
      id: updated.id.toString(),
      role: payload.role, // Use role from JWT payload
    },
  });
}
