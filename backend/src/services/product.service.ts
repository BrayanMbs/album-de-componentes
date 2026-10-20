import { DummyJsonAdapter } from "../adapters/dummyjson/dummyjson.adapter.js";
import { HardwareAdapter } from "../adapters/hardware/hardware.adapter.js";
import { mapDummyJsonProduct } from "../mappers/dummyjson-product.mapper.js";
import type { NormalizedProduct, ProductPage, ProductSource } from "../models/product.js";
import type { ProductQuery } from "../schemas/product.schemas.js";
import { AppError } from "../utils/app-error.js";

export class ProductService {
  constructor(
    private readonly dummyJsonAdapter = new DummyJsonAdapter(),
    private readonly hardwareAdapter = new HardwareAdapter(),
  ) {}

  async list(query: ProductQuery): Promise<ProductPage> {
    let data: NormalizedProduct[];
    let total: number;

    if (query.source === "hardware") {
      const result = await this.hardwareAdapter.list({
        page: query.page,
        limit: query.limit,
        ...(query.q ? { q: query.q } : {}),
        ...(query.category ? { category: query.category } : {}),
        ...(query.placement ? { placement: query.placement } : {}),
        ...(query.sort ? { sort: query.sort } : {}),
      });
      data = result.products;
      total = result.total;
    } else {
      const result = await this.dummyJsonAdapter.list({
        page: query.page,
        limit: query.limit,
        ...(query.q ? { q: query.q } : {}),
        ...(query.category ? { category: query.category } : {}),
        ...(query.sort ? { sort: query.sort } : {}),
      });
      data = result.products.map(mapDummyJsonProduct);
      total = result.total;
    }

    return {
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async getById(source: ProductSource, id: string): Promise<NormalizedProduct> {
    if (source === "hardware") return this.hardwareAdapter.getById(id);
    if (source !== "dummyjson") {
      throw new AppError(501, "Not Implemented", `Source '${source}' is prepared but not enabled yet`);
    }
    return mapDummyJsonProduct(await this.dummyJsonAdapter.getById(id));
  }
}

