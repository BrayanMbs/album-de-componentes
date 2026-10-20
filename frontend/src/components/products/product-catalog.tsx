"use client";

import { useEffect, useState, type FormEvent } from "react";
import { HARDWARE_CATEGORIES, TECHNOLOGY_CATEGORIES } from "@/constants/categories";
import { getProducts, type ProductFilters } from "@/services/api";
import type { ProductPage } from "@/types/product";
import { ProductCard } from "./product-card";
import { ProductGridSkeleton } from "./product-grid-skeleton";
import { StatusPanel } from "../ui/status-panel";

interface ProductCatalogProps {
  initialFilters?: ProductFilters;
}

export function ProductCatalog({ initialFilters = {} }: ProductCatalogProps) {
  const [result, setResult] = useState<ProductPage | null>(null);
  const [filters, setFilters] = useState<ProductFilters>({ page: 1, limit: 12, source: "hardware", ...initialFilters });
  const [searchInput, setSearchInput] = useState(initialFilters.q ?? "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getProducts(filters, controller.signal)
      .then(setResult)
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "No se pudo cargar el catálogo");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [filters]);

  function updateFilters(update: (current: ProductFilters) => ProductFilters) {
    setLoading(true);
    setError(null);
    setFilters(update);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateFilters((current) => ({ ...current, q: searchInput.trim() || undefined, page: 1 }));
  }

  function handleCategoryClick(categoryValue: string) {
    updateFilters((current) => ({
      ...current,
      category: categoryValue || undefined,
      page: 1,
    }));
  }

  const categories = filters.source === "dummyjson" ? TECHNOLOGY_CATEGORIES : HARDWARE_CATEGORIES;
  const currentCategoryObj = categories.find((c) => (c.value || undefined) === filters.category);

  return (
    <div className="space-y-6">
      {/* Category Pills Bar for quick browsing */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {categories.map((category) => {
            const isActive = (filters.category ?? "") === category.value;
            return (
              <button
                key={category.value || "all"}
                type="button"
                onClick={() => handleCategoryClick(category.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/25 scale-[1.02]"
                    : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/80"
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Filter & Search Form */}
      <form
        onSubmit={submitSearch}
        className="panel p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_200px_160px_180px_auto] items-center"
        aria-label="Filtros del catálogo"
      >
        <div className="relative">
          <input
            id="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="field pl-9 pr-8"
            placeholder="Buscar por modelo o marca (ej. Ryzen 7, RTX 4070, Logitech)..."
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchInput ? (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                updateFilters((current) => ({ ...current, q: undefined, page: 1 }));
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          ) : null}
        </div>

        <select
          id="source"
          className="field text-xs sm:text-sm"
          value={filters.source ?? "hardware"}
          onChange={(event) =>
            updateFilters((current) => ({
              ...current,
              source: event.target.value as ProductFilters["source"],
              category: undefined,
              placement: undefined,
              page: 1,
            }))
          }
        >
          <option value="hardware">Álbum de Hardware Real</option>
          <option value="dummyjson">Otros dispositivos tecnológicos</option>
        </select>

        {filters.source === "hardware" ? (
          <select
            id="placement"
            className="field text-xs sm:text-sm"
            value={filters.placement ?? ""}
            onChange={(event) =>
              updateFilters((current) => ({
                ...current,
                placement: (event.target.value || undefined) as ProductFilters["placement"],
                page: 1,
              }))
            }
          >
            <option value="">Todo el equipo</option>
            <option value="internal">Solo internos (PC)</option>
            <option value="external">Periféricos y externos</option>
          </select>
        ) : (
          <div className="hidden lg:block" />
        )}

        <select
          id="sort"
          className="field text-xs sm:text-sm"
          value={filters.sort ?? ""}
          onChange={(event) =>
            updateFilters((current) => ({
              ...current,
              sort: (event.target.value || undefined) as ProductFilters["sort"],
              page: 1,
            }))
          }
        >
          <option value="">Orden recomendado</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
          {filters.source === "dummyjson" ? <option value="rating-desc">Mejor calificación</option> : null}
        </select>

        <button className="button-primary text-xs sm:text-sm sm:col-span-2 lg:col-span-1" type="submit">
          Buscar
        </button>
      </form>

      {/* Catalog Status and Active Filters */}
      {loading ? <ProductGridSkeleton /> : null}
      {!loading && error ? <StatusPanel title="No pudimos cargar el catálogo" message={error} /> : null}
      {!loading && !error && result?.data.length === 0 ? (
        <StatusPanel
          title="Sin resultados"
          message="No encontramos componentes con los filtros seleccionados. Intenta otra búsqueda o limpia los filtros."
          actionHref="/products"
          actionLabel="Ver todo el catálogo"
        />
      ) : null}

      {!loading && !error && result && result.data.length > 0 ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base">{result.pagination.total}</span>
              <span>productos encontrados</span>
              {currentCategoryObj?.value ? (
                <span className="font-bold text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                  {currentCategoryObj.label}
                </span>
              ) : null}
            </div>

            <span className="text-slate-500">
              Página {result.pagination.page} de {Math.max(1, result.pagination.totalPages)}
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {result.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              className="button-secondary text-xs sm:text-sm"
              disabled={filters.page === 1}
              onClick={() => updateFilters((current) => ({ ...current, page: Math.max(1, (current.page ?? 1) - 1) }))}
            >
              ← Anterior
            </button>
            <span className="text-xs sm:text-sm text-slate-300 font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              {result.pagination.page} / {Math.max(1, result.pagination.totalPages)}
            </span>
            <button
              className="button-secondary text-xs sm:text-sm"
              disabled={filters.page === result.pagination.totalPages}
              onClick={() => updateFilters((current) => ({ ...current, page: (current.page ?? 1) + 1 }))}
            >
              Siguiente →
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
