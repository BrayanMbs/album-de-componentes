"use client";

export default function ProductsError({ reset }: { error: Error; reset: () => void }) {
  return <section className="container-shell py-20 text-center"><h1 className="text-2xl font-black text-white">Ocurrió un error inesperado</h1><p className="mt-2 text-slate-400">No pudimos mostrar esta página.</p><button type="button" className="button-primary mt-6" onClick={reset}>Reintentar</button></section>;
}

