import { Router } from "express";
import rateLimit from "express-rate-limit";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const multer = require("multer");
import path from "path";
import fs from "fs";
import {
  register,
  login,
  me,
  logout,
  refreshToken,
  updatePassword,
  updateProfile,
  updateAvatar,
} from "../controllers/authController";
import { requireAuth } from "../middleware/auth";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

const avatarUploadDir = process.env.AVATAR_UPLOAD_DIR || "uploads/avatars";
if (!fs.existsSync(avatarUploadDir)) {
  fs.mkdirSync(avatarUploadDir, { recursive: true });
}

const storage = (multer as any).diskStorage({
  destination(
    req: any,
    file: any,
    cb: (error: Error | null, destination: string) => void
  ) {
    cb(null, avatarUploadDir);
  },
  filename(
    req: any,
    file: any,
    cb: (error: Error | null, filename: string) => void
  ) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, base + "-" + unique + ext);
  },
});

const uploadAvatar = multer({ storage });

export const authRouter = Router();

authRouter.post("/register", authLimiter, register);

authRouter.post("/login", authLimiter, login);

authRouter.get("/me", requireAuth, me);

authRouter.post("/logout", requireAuth, logout);

authRouter.post("/refresh", authLimiter, refreshToken);

authRouter.put("/password", requireAuth, updatePassword);

authRouter.put("/profile", requireAuth, updateProfile);

authRouter.post(
  "/avatar",
  requireAuth,
  uploadAvatar.single("avatar"),
  updateAvatar
);
