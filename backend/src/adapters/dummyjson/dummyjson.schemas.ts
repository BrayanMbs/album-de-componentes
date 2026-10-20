import { z } from "zod";

export const dummyJsonProductSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  description: z.string().optional(),
  category: z.string(),
  price: z.number().nonnegative().optional(),
  rating: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  brand: z.string().optional(),
  thumbnail: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  availabilityStatus: z.string().optional(),
  warrantyInformation: z.string().optional(),
  shippingInformation: z.string().optional(),
  returnPolicy: z.string().optional(),
});

export type DummyJsonProduct = z.infer<typeof dummyJsonProductSchema>;

export const dummyJsonListSchema = z.object({
  products: z.array(dummyJsonProductSchema),
  total: z.number().int().nonnegative(),
  skip: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
});

