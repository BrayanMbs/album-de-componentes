export type ProductSource = "hardware" | "dummyjson" | "gpu-specs" | "bestbuy";

export interface ProductSpecifications {
  cpu?: string;
  gpu?: string;
  ramGb?: number;
  storageGb?: number;
  vramGb?: number;
  architecture?: string;
  tdpWatts?: number;
  releaseYear?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface NormalizedProduct {
  id: string;
  externalId: string;
  source: ProductSource;
  name: string;
  description?: string;
  brand?: string;
  category: string;
  price?: number;
  currency?: string;
  image?: string;
  images?: string[];
  rating?: number;
  stock?: number;
  availability?: string;
  specifications?: ProductSpecifications;
  dataSource?: string;
  sourceUrl?: string;
  dataUpdatedAt?: string;
  imageNote?: string;
}

export interface ProductPage {
  data: NormalizedProduct[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

