import type { Metadata } from "next";
import { ComparisonTable } from "@/components/comparison/comparison-table";

export const metadata: Metadata = { title: "Comparar" };

export default function ComparePage() {
  return <section className="container-shell py-12"><div className="mb-8"><p className="text-sm font-bold uppercase tracking-widest text-cyan-400">Comparador</p><h1 className="mt-2 text-4xl font-black text-white">Diferencias, lado a lado</h1><p className="mt-3 text-slate-400">Compara hasta tres productos de la misma categoría.</p></div><ComparisonTable /></section>;
}

