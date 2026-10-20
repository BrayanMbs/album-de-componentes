import type { NormalizedProduct, ProductPage, ProductSource } from "@/types/product";

const publicApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function getApiUrl(): string {
  if (typeof window === "undefined") return process.env.API_INTERNAL_URL ?? publicApiUrl;
  return publicApiUrl;
}

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    signal,
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new ApiError(response.status, body?.message ?? "No se pudo completar la solicitud");
  }
  return response.json() as Promise<T>;
}

export interface ProductFilters {
  q?: string;
  category?: string;
  source?: "hardware" | "dummyjson";
  placement?: "internal" | "external";
  page?: number;
  limit?: number;
  sort?: "price-asc" | "price-desc" | "rating-desc";
}

export function getProducts(filters: ProductFilters = {}, signal?: AbortSignal): Promise<ProductPage> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  return apiFetch<ProductPage>(`/api/products?${params}`, signal);
}

export async function getProduct(source: ProductSource, id: string): Promise<NormalizedProduct> {
  const response = await apiFetch<{ data: NormalizedProduct }>(
    `/api/products/${encodeURIComponent(source)}/${encodeURIComponent(id)}`,
  );
  return response.data;
}

