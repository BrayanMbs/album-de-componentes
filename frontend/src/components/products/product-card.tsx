"use client";

import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addProduct, removeProduct } from "@/store/slices/comparisonSlice";
import type { NormalizedProduct } from "@/types/product";
import { formatPrice } from "@/utils/format";

export function ProductCard({ product }: { product: NormalizedProduct }) {
  const dispatch = useAppDispatch();
  const selectedProducts = useAppSelector((state) => state.comparison.selectedProducts);
  const isComparing = selectedProducts.some((item) => item.id === product.id);

  function handleToggleCompare(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (isComparing) {
      dispatch(removeProduct(product.id));
    } else {
      dispatch(addProduct(product));
    }
  }

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/10">
      <Link href={`/products/${product.source}/${product.externalId}`} className="block">
        {/* Showcase image container without jarring white box */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 p-4 border-b border-slate-800/60 flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent opacity-40 group-hover:opacity-100 transition-opacity" />
          
          {product.image ? (
            <div className="relative h-full w-full rounded-xl overflow-hidden flex items-center justify-center">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="grid h-full place-items-center text-xs text-slate-500 font-medium">Sin imagen disponible</div>
          )}

          {/* Quick badge top right */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            {isComparing ? (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                En lista
              </span>
            ) : null}
          </div>
        </div>

        <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800/80 text-cyan-400 border border-slate-700/60">
                {product.brand ?? "Sin marca"}
              </span>
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <span className="text-amber-400">★</span>
                {product.rating ? product.rating.toFixed(1) : "—"}
              </span>
            </div>

            <h2 className="line-clamp-2 min-h-11 text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
              {product.name}
            </h2>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Precio</span>
              <span className="text-lg sm:text-xl font-black text-emerald-400 tracking-tight">
                {formatPrice(product.price, product.currency)}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 bg-slate-800/40 px-2 py-0.5 rounded capitalize">
              {product.category.replaceAll("-", " ")}
            </span>
          </div>
        </div>
      </Link>

      {/* Direct Compare Button in Footer */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <button
          type="button"
          onClick={handleToggleCompare}
          className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
            isComparing
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30"
              : "bg-slate-800/70 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-500/50 shadow-sm"
          }`}
        >
          {isComparing ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Quitar de comparación
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar a comparación
            </>
          )}
        </button>
      </div>
    </article>
  );
}
