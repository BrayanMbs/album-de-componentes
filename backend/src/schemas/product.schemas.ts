import { z } from "zod";

export const productQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.string().trim().max(60).optional(),
  source: z.enum(["hardware", "dummyjson"]).default("hardware"),
  placement: z.enum(["internal", "external"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  sort: z.enum(["price-asc", "price-desc", "rating-desc"]).optional(),
});

export type ProductQuery = z.infer<typeof productQuerySchema>;

export const productParamsSchema = z.object({
  source: z.enum(["hardware", "dummyjson", "gpu-specs", "bestbuy"]),
  id: z.string().trim().min(1).max(100),
});

