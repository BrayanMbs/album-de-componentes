import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  EXTERNAL_API_TIMEOUT_MS: z.coerce.number().int().positive().default(8000),
  DUMMYJSON_CACHE_TTL_MS: z.coerce.number().int().nonnegative().default(300_000),
  BESTBUY_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);

