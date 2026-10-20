import type { Metadata } from "next";
import { ProductCatalog } from "@/components/products/product-catalog";

export const metadata: Metadata = { title: "Catálogo" };

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; q?: string; source?: "hardware" | "dummyjson"; placement?: "internal" | "external" }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category, q, source, placement } = await searchParams;
  return <section className="container-shell py-12"><div className="mb-8"><p className="text-sm font-bold uppercase tracking-widest text-cyan-400">Álbum de hardware real</p><h1 className="mt-2 text-4xl font-black text-white">Componentes internos y externos</h1><p className="mt-3 text-slate-400">Modelos, especificaciones y precios reales con fotografías de producto para los componentes principales.</p></div><ProductCatalog initialFilters={{ source: source ?? "hardware", ...(category ? { category } : {}), ...(q ? { q } : {}), ...(placement ? { placement } : {}) }} /></section>;
}

