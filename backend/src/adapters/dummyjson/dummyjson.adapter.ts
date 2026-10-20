import { env } from "../../config/env.js";
import { AppError } from "../../utils/app-error.js";
import { MemoryCache } from "../../utils/memory-cache.js";
import { dummyJsonListSchema, dummyJsonProductSchema, type DummyJsonProduct } from "./dummyjson.schemas.js";

const BASE_URL = "https://dummyjson.com";
const cache = new MemoryCache();

export interface DummyJsonListOptions {
  q?: string;
  category?: string;
  page: number;
  limit: number;
  sort?: "price-asc" | "price-desc" | "rating-desc";
}

export interface DummyJsonListResult {
  products: DummyJsonProduct[];
  total: number;
}

async function fetchJson(path: string): Promise<unknown> {
  const cached = cache.get<unknown>(path);
  if (cached !== undefined) return cached;

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      signal: AbortSignal.timeout(env.EXTERNAL_API_TIMEOUT_MS),
      headers: { Accept: "application/json" },
    });
    if (response.status === 404) throw new AppError(404, "Not Found", "Product not found");
    if (response.status === 429) throw new AppError(503, "Service Unavailable", "Product provider rate limit reached");
    if (!response.ok) throw new AppError(502, "Bad Gateway", `Product provider returned ${response.status}`);
    const data: unknown = await response.json();
    cache.set(path, data, env.DUMMYJSON_CACHE_TTL_MS);
    return data;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new AppError(504, "Gateway Timeout", "Product provider timed out");
    }
    throw new AppError(502, "Bad Gateway", "Unable to reach product provider");
  }
}

export class DummyJsonAdapter {
  async list(options: DummyJsonListOptions): Promise<DummyJsonListResult> {
    const pageOffset = (options.page - 1) * options.limit;
    const filtersSearchLocally = Boolean(options.q && options.category);
    const params = new URLSearchParams({
      limit: filtersSearchLocally ? "0" : String(options.limit),
      skip: filtersSearchLocally ? "0" : String(pageOffset),
    });

    if (options.sort) {
      const [sortBy, order] = options.sort === "rating-desc" ? ["rating", "desc"] : ["price", options.sort.endsWith("asc") ? "asc" : "desc"];
      params.set("sortBy", sortBy);
      params.set("order", order);
    }

    let path = `/products?${params}`;
    if (options.q) {
      params.set("q", options.q);
      path = `/products/search?${params}`;
    } else if (options.category) {
      path = `/products/category/${encodeURIComponent(options.category)}?${params}`;
    }

    const parsed = dummyJsonListSchema.safeParse(await fetchJson(path));
    if (!parsed.success) throw new AppError(502, "Bad Gateway", "Product provider returned invalid data");

    const matchingProducts = options.q && options.category
      ? parsed.data.products.filter((product) => product.category === options.category)
      : parsed.data.products;
    const products = filtersSearchLocally
      ? matchingProducts.slice(pageOffset, pageOffset + options.limit)
      : matchingProducts;

    return { products, total: filtersSearchLocally ? matchingProducts.length : parsed.data.total };
  }

  async getById(id: string): Promise<DummyJsonProduct> {
    const parsed = dummyJsonProductSchema.safeParse(await fetchJson(`/products/${encodeURIComponent(id)}`));
    if (!parsed.success) throw new AppError(502, "Bad Gateway", "Product provider returned invalid data");
    return parsed.data;
  }
}

