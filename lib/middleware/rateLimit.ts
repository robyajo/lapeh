import rateLimit from "express-rate-limit";
// import { redis } from "../core/redis"; // Optional: Use Redis for distributed rate limiting

// Rate limiting untuk mencegah brute force dan DDoS ringan
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Batas 100 request per window per IP
  standardHeaders: true, // Return rate limit info di `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: "Terlalu banyak permintaan, silakan coba lagi nanti.",
  },
});
