import type { DummyJsonProduct } from "../adapters/dummyjson/dummyjson.schemas.js";
import type { NormalizedProduct, ProductSpecifications } from "../models/product.js";

export function mapDummyJsonProduct(product: DummyJsonProduct): NormalizedProduct {
  const specifications: ProductSpecifications = {};
  if (product.warrantyInformation) specifications.warranty = product.warrantyInformation;
  if (product.shippingInformation) specifications.shipping = product.shippingInformation;
  if (product.returnPolicy) specifications.returnPolicy = product.returnPolicy;

  return {
    id: `dummyjson-${product.id}`,
    externalId: String(product.id),
    source: "dummyjson",
    name: product.title,
    ...(product.description ? { description: product.description } : {}),
    ...(product.brand ? { brand: product.brand } : {}),
    category: product.category,
    ...(product.price !== undefined ? { price: product.price, currency: "USD" } : {}),
    ...(product.thumbnail ? { image: product.thumbnail } : {}),
    ...(product.images ? { images: product.images } : {}),
    ...(product.rating !== undefined ? { rating: product.rating } : {}),
    ...(product.stock !== undefined ? { stock: product.stock } : {}),
    ...(product.availabilityStatus ? { availability: product.availabilityStatus } : {}),
    ...(Object.keys(specifications).length > 0 ? { specifications } : {}),
  };
}

