"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearComparison, clearNotice, removeProduct } from "@/store/slices/comparisonSlice";

export function FloatingComparisonBar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { selectedProducts, notice } = useAppSelector((state) => state.comparison);

  // Don't show floating bar on the comparison page itself
  if (pathname === "/compare" || selectedProducts.length === 0) {
    if (notice) {
      return (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border border-amber-500/40 bg-slate-900/95 p-4 text-xs text-amber-200 shadow-2xl backdrop-blur-md">
          <div className="flex items-start justify-between gap-3">
            <span>{notice}</span>
            <button onClick={() => dispatch(clearNotice())} className="text-slate-400 hover:text-white" type="button">✕</button>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <aside aria-label="Productos en comparación" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[min(94vw,42rem)]">
      {notice ? (
        <div className="mb-2 flex items-center justify-between rounded-xl border border-amber-500/40 bg-slate-900/95 px-4 py-2 text-xs text-amber-200 shadow-xl backdrop-blur-md">
          <span>{notice}</span>
          <button onClick={() => dispatch(clearNotice())} className="font-bold text-slate-400 hover:text-white ml-2" type="button">✕</button>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-4 rounded-2xl border border-cyan-500/30 bg-slate-950/90 p-3.5 shadow-2xl shadow-cyan-950/50 backdrop-blur-xl">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="hidden sm:block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block">Comparando</span>
            <span className="text-xs font-semibold text-slate-300">{selectedProducts.length} de 3 máx.</span>
          </div>

          <div className="flex items-center gap-2">
            {selectedProducts.map((product) => (
              <div
                key={product.id}
                className="group relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-1 flex items-center justify-center shadow-inner"
                title={product.name}
              >
                {product.image ? (
                  <Image src={product.image} alt={product.name} fill sizes="44px" className="object-contain p-1" />
                ) : (
                  <span className="text-[9px] text-slate-500">Hardware</span>
                )}
                <button
                  type="button"
                  onClick={() => dispatch(removeProduct(product.id))}
                  className="absolute inset-0 bg-rose-950/90 text-rose-300 text-xs font-black opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  aria-label={`Quitar ${product.name}`}
                >
                  ✕
                </button>
              </div>
            ))}

            {Array.from({ length: 3 - selectedProducts.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="hidden h-11 w-11 rounded-xl border border-dashed border-slate-800 bg-slate-900/40 sm:grid place-items-center text-slate-600 text-xs font-bold"
              >
                +
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => dispatch(clearComparison())}
            className="text-xs font-medium text-slate-400 hover:text-rose-300 transition-colors px-2 py-1"
          >
            Limpiar
          </button>

          <Link
            href="/compare"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-950 shadow-md shadow-cyan-500/25 transition-all hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/40"
          >
            <span>Ver diferencias</span>
            <span className="rounded-full bg-slate-950/20 px-1.5 py-0.2 text-xs font-black">
              {selectedProducts.length}
            </span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
