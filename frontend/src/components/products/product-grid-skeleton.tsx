export function ProductGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Cargando productos">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="aspect-[4/3] animate-pulse bg-slate-800" />
          <div className="space-y-3 p-5"><div className="h-3 w-1/3 animate-pulse rounded bg-slate-800" /><div className="h-5 animate-pulse rounded bg-slate-800" /><div className="h-7 w-1/2 animate-pulse rounded bg-slate-800" /></div>
        </div>
      ))}
    </div>
  );
}

