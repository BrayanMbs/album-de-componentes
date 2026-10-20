"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearComparison, removeProduct } from "@/store/slices/comparisonSlice";
import { formatPrice, labelFromKey } from "@/utils/format";
import { StatusPanel } from "../ui/status-panel";

export function ComparisonTable() {
  const products = useAppSelector((state) => state.comparison.selectedProducts);
  const dispatch = useAppDispatch();
  const [onlyDifferences, setOnlyDifferences] = useState(false);

  if (products.length === 0) {
    return (
      <StatusPanel
        title="Tu comparador está vacío"
        message="Selecciona hasta 3 componentes de la misma categoría desde el catálogo para ver sus especificaciones, rendimiento y precios frente a frente."
        actionHref="/products"
        actionLabel="Explorar catálogo de hardware"
      />
    );
  }

  const category = products[0]?.category;
  const specificationKeys = Array.from(
    new Set(products.flatMap((product) => Object.keys(product.specifications ?? {})))
  );

  // Price calculations
  const validPrices = products.map((p) => p.price).filter((p): p is number => typeof p === "number");
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;
  const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : null;
  const priceDifference = minPrice !== null && maxPrice !== null && minPrice !== maxPrice ? maxPrice - minPrice : null;
  const cheapestProduct = minPrice !== null ? products.find((p) => p.price === minPrice) : null;

  // Rating calculations
  const validRatings = products.map((p) => p.rating).filter((r): r is number => typeof r === "number");
  const topRating = validRatings.length > 0 ? Math.max(...validRatings) : null;
  const hasRatings = validRatings.length > 0;

  // Recommended calculation
  const recommended = products
    .filter((product) => (topRating ? (product.rating ?? 0) >= topRating - 0.2 : true))
    .toSorted((a, b) => (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY))[0];

  // Base rows
  const allRows: { label: string; key: string; values: (string | undefined)[]; isDifferent: boolean }[] = [
    {
      label: "Marca",
      key: "brand",
      values: products.map((p) => p.brand ?? "No indicada"),
      isDifferent: new Set(products.map((p) => p.brand)).size > 1,
    },
    {
      label: "Precio",
      key: "price",
      values: products.map((p) => formatPrice(p.price, p.currency)),
      isDifferent: new Set(products.map((p) => p.price)).size > 1,
    },
    {
      label: "Calificación",
      key: "rating",
      values: products.map((p) => (p.rating ? `★ ${p.rating.toFixed(1)}` : "Sin calificar")),
      isDifferent: new Set(products.map((p) => p.rating)).size > 1,
    },
    {
      label: "Disponibilidad",
      key: "availability",
      values: products.map((p) => p.availability ?? "No indicada"),
      isDifferent: new Set(products.map((p) => p.availability)).size > 1,
    },
    ...specificationKeys.map((key) => {
      const values = products.map((p) => {
        const val = p.specifications?.[key];
        return val !== undefined ? String(val) : "—";
      });
      const uniqueValues = new Set(values);
      return {
        label: labelFromKey(key),
        key,
        values,
        isDifferent: uniqueValues.size > 1,
      };
    }),
  ];

  const displayedRows = onlyDifferences ? allRows.filter((row) => row.isDifferent) : allRows;

  return (
    <div className="space-y-8">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Categoría: {category?.replaceAll("-", " ") || "Hardware"}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-slate-400 font-medium">
            {products.length} de 3 comparados
          </span>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyDifferences}
              onChange={(e) => setOnlyDifferences(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
            />
            Solo mostrar diferencias ({allRows.filter((r) => r.isDifferent).length})
          </label>

          <button
            type="button"
            className="text-xs font-bold text-rose-300 hover:text-rose-200 transition-colors px-3 py-1.5 rounded-lg border border-rose-500/20 hover:border-rose-500/40 bg-rose-500/10"
            onClick={() => dispatch(clearComparison())}
          >
            Limpiar todo
          </button>
        </div>
      </div>

      {/* Side-by-side product hero cards */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const isCheapest = minPrice !== null && product.price === minPrice && products.length > 1;
          const isTopRated = topRating !== null && product.rating === topRating && products.length > 1;

          return (
            <div
              key={product.id}
              className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border backdrop-blur-md p-5 transition-all duration-300 ${
                isCheapest
                  ? "border-emerald-500/60 bg-gradient-to-b from-emerald-950/20 via-slate-900/80 to-slate-950 shadow-xl shadow-emerald-950/20"
                  : "border-slate-800/80 bg-slate-900/60"
              }`}
            >
              {/* Badges on top */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  {product.brand ?? "Sin marca"}
                </span>
                {isCheapest ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    🏆 Mejor precio
                  </span>
                ) : null}
                {isTopRated && !isCheapest ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    ⭐ Mayor puntuación
                  </span>
                ) : null}
              </div>

              {/* Product showroom image */}
              <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 border border-slate-800/60 p-4 flex items-center justify-center">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-contain p-2"
                  />
                ) : (
                  <div className="text-xs text-slate-500">Sin imagen</div>
                )}
              </div>

              {/* Title & Price */}
              <div className="mt-4 flex-1">
                <h3 className="text-base font-bold text-white line-clamp-2 min-h-12 hover:text-cyan-300 transition-colors">
                  <Link href={`/products/${product.source}/${product.externalId}`}>
                    {product.name}
                  </Link>
                </h3>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-emerald-400">
                    {formatPrice(product.price, product.currency)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {product.rating ? `★ ${product.rating.toFixed(1)}` : "—"}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <Link
                  href={`/products/${product.source}/${product.externalId}`}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Ver ficha completa →
                </Link>

                <button
                  type="button"
                  onClick={() => dispatch(removeProduct(product.id))}
                  className="text-xs font-medium text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                  title="Quitar de comparación"
                >
                  Eliminar ✕
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty slots prompting user to add another model */}
        {Array.from({ length: Math.max(0, 3 - products.length) }).map((_, index) => (
          <div
            key={`empty-slot-${index}`}
            className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-800/80 bg-slate-950/40 text-center min-h-[360px]"
          >
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 text-xl font-bold mb-4">
              +
            </div>
            <h4 className="text-sm font-bold text-slate-300">
              {products.length === 1 ? "Agrega otro componente para comparar" : "Espacio disponible"}
            </h4>
            <p className="mt-2 text-xs text-slate-500 max-w-xs">
              {category
                ? `Elige otro producto de la categoría ${category.replaceAll("-", " ")} de una marca diferente para ver el balance.`
                : "Explora el catálogo y selecciona productos para ponerlos cara a cara."}
            </p>
            <Link
              href={category ? `/products?source=hardware&category=${category}` : "/products"}
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 transition-all hover:bg-cyan-500/20"
            >
              Buscar en el catálogo →
            </Link>
          </div>
        ))}
      </div>

      {/* Decision & Verdict Panel */}
      {products.length >= 2 && recommended ? (
        <aside className="rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/30 p-6 shadow-xl shadow-cyan-950/20 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <p className="text-xs font-black uppercase tracking-widest text-cyan-300">
                  Veredicto objetivo de la comparación
                </p>
              </div>
              <h2 className="mt-2 text-xl font-black text-white">{recommended.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300 max-w-3xl">
                {hasRatings
                  ? "Recomendación sugerida: mantiene una puntuación destacada frente a los demás comparados con el costo más balanceado."
                  : "Recomendado como la opción más accesible dentro de esta comparación manteniendo prestaciones equivalentes."}
                {priceDifference && cheapestProduct ? (
                  <span className="block mt-1 text-emerald-300 font-semibold">
                    💡 Margen entre modelos: diferencia de {formatPrice(priceDifference, cheapestProduct.currency)} entre la opción más económica y la más costosa.
                  </span>
                ) : null}
              </p>
            </div>

            <Link
              href={`/products/${recommended.source}/${recommended.externalId}`}
              className="button-primary text-xs font-black px-5 py-2.5"
            >
              Elegir este componente
            </Link>
          </div>
        </aside>
      ) : null}

      {/* Smart Side-by-side Table with difference highlights */}
      <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md shadow-2xl">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Tabla detallada de especificaciones
          </h3>
          <span className="text-xs text-slate-400">
            {displayedRows.length} filas ({allRows.filter((r) => r.isDifferent).length} con diferencias)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="w-56 p-4">Característica</th>
                {products.map((product) => (
                  <th key={product.id} className="p-4 text-white font-bold">
                    {product.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {displayedRows.map((row) => (
                <tr
                  key={row.key}
                  className={`transition-colors ${
                    row.isDifferent
                      ? "bg-cyan-500/[0.03] hover:bg-cyan-500/[0.07]"
                      : "hover:bg-slate-800/30"
                  }`}
                >
                  <th className="p-4 font-semibold text-slate-300 text-xs sm:text-sm bg-slate-950/30">
                    <div className="flex items-center gap-2">
                      <span>{row.label}</span>
                      {row.isDifferent ? (
                        <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.2 rounded">
                          Difiere
                        </span>
                      ) : null}
                    </div>
                  </th>

                  {row.values.map((val, index) => {
                    const isLowestPrice = row.key === "price" && products[index]?.price === minPrice && minPrice !== null && products.length > 1;

                    return (
                      <td
                        key={`${row.key}-${products[index]?.id}`}
                        className={`p-4 text-slate-200 font-medium ${
                          isLowestPrice ? "text-emerald-400 font-bold bg-emerald-500/[0.05]" : ""
                        }`}
                      >
                        {val}
                        {isLowestPrice ? (
                          <span className="ml-2 inline-block text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider bg-emerald-500/20 px-1.5 py-0.5 rounded">
                            Económico
                          </span>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-500 text-center">
        Los datos técnicos y precios proceden directamente de fuentes abiertas. Una especificación aislada no define el rendimiento en conjunto.
      </p>
    </div>
  );
}
