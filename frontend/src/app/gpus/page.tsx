import { StatusPanel } from "@/components/ui/status-panel";

export default function GpusPage() {
  return <section className="container-shell py-12"><div className="mb-8"><p className="text-sm font-bold uppercase tracking-widest text-cyan-400">GPUs</p><h1 className="mt-2 text-4xl font-black text-white">Catálogo especializado</h1></div><StatusPanel title="Integración preparada" message="El adaptador de GPU Specs se incorporará en la segunda fase con validación y caché controlada desde el backend." actionHref="/products" actionLabel="Ver productos disponibles" /></section>;
}

