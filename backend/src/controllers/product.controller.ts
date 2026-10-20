import type { NextFunction, Request, Response } from "express";
import { productParamsSchema, productQuerySchema } from "../schemas/product.schemas.js";
import { ProductService } from "../services/product.service.js";

const service = new ProductService();

export async function listProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = productQuerySchema.parse(req.query);
    res.json(await service.list(query));
  } catch (error) {
    next(error);
  }
}

export async function getProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const params = productParamsSchema.parse(req.params);
    res.json({ data: await service.getById(params.source, params.id) });
  } catch (error) {
    next(error);
  }
}

