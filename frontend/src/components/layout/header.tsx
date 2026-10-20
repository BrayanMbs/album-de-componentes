"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

export function Header() {
  const pathname = usePathname();
  const selectedCount = useAppSelector((state) => state.comparison.selectedProducts.length);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="container-shell flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <svg className="w-4 h-4 text-slate-950 font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m14-6h2m-2 6h2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <span className="text-lg font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors">
            PC <span className="text-cyan-400">Compare</span>
          </span>
        </Link>

        <nav aria-label="Navegación principal" className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold">
          <Link
            href="/products"
            className={`transition-colors py-1 ${
              pathname.startsWith("/products") ? "text-cyan-400 font-bold" : "text-slate-300 hover:text-white"
            }`}
          >
            Catálogo de Hardware
          </Link>

          <Link
            href="/compare"
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 transition-all font-bold ${
              selectedCount > 0
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500"
                : "border border-slate-700/80 bg-slate-900/80 text-slate-300 hover:border-cyan-500/40 hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Comparar</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
                selectedCount > 0 ? "bg-slate-950/25 text-slate-950" : "bg-slate-800 text-cyan-400"
              }`}
            >
              {selectedCount}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
