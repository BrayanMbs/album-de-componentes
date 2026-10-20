import type { Metadata } from "next";
import type { ReactNode } from "react";
import { FloatingComparisonBar } from "@/components/comparison/floating-comparison-bar";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { StoreProvider } from "@/store/store-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "PC Compare", template: "%s | PC Compare" },
  description: "Catálogo y comparación objetiva de equipos de cómputo y tecnología.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950">
        <StoreProvider>
          <Header />
          <main className="flex-1 pb-16">{children}</main>
          <FloatingComparisonBar />
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}

