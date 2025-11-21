import { getEnv } from "../services/utils/get-env";

export const Env = {
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: getEnv("PORT", "8000"),

  MONGO_URI: getEnv(
    "MONGO_URI",
    "mongodb+srv://mohitraghav350_db_user:QRxVPCwjxKIEzE07@cluster0.dmbrr7s.mongodb.net/fiora?retryWrites=true&w=majority"
  ),

  JWT_SECRET: getEnv("JWT_SECRET", "secret_jwt"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "15m"),

  FRONTEND_ORIGIN: getEnv(
    "FRONTEND_ORIGIN",
    "http://localhost:5173"
  ).replace(/\/+$/, ""),

  CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME", "dy8qfihsz"),
  CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY", "842725345293151"),
  CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET", "RgslFKTRoUf-TKwFOtOJnSSqt6M"),
} as const;
