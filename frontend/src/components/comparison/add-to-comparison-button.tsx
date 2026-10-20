"use client";

import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addProduct, removeProduct, clearNotice } from "@/store/slices/comparisonSlice";
import type { NormalizedProduct } from "@/types/product";

export function AddToComparisonButton({ product }: { product: NormalizedProduct }) {
  const dispatch = useAppDispatch();
  const notice = useAppSelector((state) => state.comparison.notice);
  const selected = useAppSelector((state) =>
    state.comparison.selectedProducts.some((item) => item.id === product.id)
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (selected) {
              dispatch(removeProduct(product.id));
            } else {
              dispatch(addProduct(product));
            }
          }}
          className={`button-primary w-full sm:w-auto flex items-center justify-center gap-2 ${
            selected
              ? "bg-slate-800 text-rose-300 border border-rose-500/40 hover:bg-rose-500/20 shadow-none"
              : ""
          }`}
        >
          {selected ? (
            <>
              <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Quitar de comparación
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar a comparación
            </>
          )}
        </button>

        {selected ? (
          <Link
            href="/compare"
            className="button-secondary w-full sm:w-auto flex items-center justify-center gap-2 text-cyan-300 border-cyan-500/40"
          >
            Ir al comparador →
          </Link>
        ) : null}
      </div>

      {notice ? (
        <div
          className="flex items-center justify-between gap-3 text-xs bg-slate-900/90 border border-amber-500/40 text-amber-200 p-3 rounded-xl backdrop-blur-md"
          role="status"
        >
          <span>{notice}</span>
          <div className="flex items-center gap-2 shrink-0">
            <Link className="font-bold text-cyan-400 hover:text-cyan-300 underline" href="/compare">
              Abrir comparador
            </Link>
            <button
              type="button"
              className="text-slate-400 hover:text-white font-bold ml-1"
              onClick={() => dispatch(clearNotice())}
              aria-label="Cerrar aviso"
            >
              ✕
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
