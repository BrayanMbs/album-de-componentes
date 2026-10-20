import { ProductGridSkeleton } from "@/components/products/product-grid-skeleton";

export default function Loading() {
  return <section className="container-shell py-12"><div className="mb-8 h-12 w-72 animate-pulse rounded bg-slate-800" /><ProductGridSkeleton /></section>;
}

