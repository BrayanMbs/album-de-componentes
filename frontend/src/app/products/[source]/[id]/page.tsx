import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToComparisonButton } from "@/components/comparison/add-to-comparison-button";
import { ApiError, getProduct } from "@/services/api";
import type { ProductSource } from "@/types/product";
import { formatPrice, labelFromKey } from "@/utils/format";

interface ProductDetailPageProps {
  params: Promise<{ source: string; id: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { source, id } = await params;
  try {
    const product = await getProduct(source as ProductSource, id);
    return { title: `${product.name} | PC Compare`, description: product.description };
  } catch {
    return { title: "Producto | PC Compare" };
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { source, id } = await params;
  let product;
  try {
    product = await getProduct(source as ProductSource, id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const specifications = Object.entries(product.specifications ?? {});

  return (
    <section className="container-shell py-8 sm:py-12">
      {/* Breadcrumb back navigation */}
      <nav aria-label="Navegación de migas de pan" className="mb-6">
        <Link
          href={product.source === "hardware" ? `/products?source=hardware&category=${product.category}` : "/products"}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-300 transition-colors"
        >
          <span>← Volver a {product.category.replaceAll("-", " ")}</span>
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 items-start">
        {/* Product image showroom */}
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 p-6 flex items-center justify-center shadow-2xl shadow-cyan-950/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent opacity-60" />
          {product.image ? (
            <div className="relative h-full w-full">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-4"
              />
            </div>
          ) : (
            <div className="grid h-full place-items-center text-slate-500 font-medium text-sm">Sin imagen</div>
          )}
        </div>

        {/* Product details */}
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-800 text-cyan-400 border border-slate-700">
                {product.brand ?? "Marca no indicada"}
              </span>
              <span className="text-xs text-slate-400 capitalize bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                {product.category.replaceAll("-", " ")}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl tracking-tight leading-tight">
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
                {formatPrice(product.price, product.currency)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 text-xs text-slate-300">
            <span className="rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 font-semibold flex items-center gap-1.5">
              <span className="text-amber-400">★</span> {product.rating ? product.rating.toFixed(1) : "Sin calificar"}
            </span>
            <span className="rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 font-semibold">
              Disponibilidad: {product.availability ?? "Registro de catálogo"}
            </span>
          </div>

          <p className="leading-7 text-sm text-slate-300 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
            {product.description ?? "Este producto no incluye descripción."}
          </p>

          <div className="pt-2">
            <AddToComparisonButton product={product} />
          </div>

          <div className="rounded-xl border border-slate-800/60 bg-slate-950/50 p-4 space-y-1.5 text-xs text-slate-400">
            <p className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Fuente:</span>
              <span className="text-slate-300 font-semibold">{product.dataSource ?? product.source}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-500">ID: {product.externalId}</span>
            </p>
            {product.dataUpdatedAt ? (
              <p className="text-slate-400">Última actualización: {product.dataUpdatedAt}</p>
            ) : null}
            {product.imageNote ? (
              <p className="text-slate-400 italic">📷 {product.imageNote}</p>
            ) : null}
            {product.sourceUrl ? (
              <p className="pt-1">
                <a
                  className="font-bold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
                  href={product.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver registro original y procedencia ↗
                </a>
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Specifications grid */}
      <div className="panel mt-12 p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-lg sm:text-xl font-black text-white">Especificaciones técnicas verificadas</h2>
          <span className="text-xs text-slate-400 font-semibold">{specifications.length} atributos</span>
        </div>

        {specifications.length > 0 ? (
          <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {specifications.map(([key, value]) => (
              <div
                key={key}
                className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 transition-colors hover:border-slate-700"
              >
                <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">{labelFromKey(key)}</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-100">{String(value)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-6 text-sm text-slate-400">
            La fuente no proporciona especificaciones adicionales verificables para este modelo.
          </p>
        )}
      </div>
    </section>
  );
}
