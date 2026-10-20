import Image from "next/image";
import Link from "next/link";
import { HARDWARE_CATEGORIES } from "@/constants/categories";

const CATEGORY_IMAGES: Record<string, string> = {
  processors: "https://cdna.pcpartpicker.com/static/forever/images/product/7e2d17b7b777f8b56e1b5119aa97be20.256p.jpg",
  "graphics-cards": "https://cdna.pcpartpicker.com/static/forever/images/product/867a636cde1c3c9762b06bde17acd022.256p.jpg",
  motherboards: "https://cdna.pcpartpicker.com/static/forever/images/product/7221b486502c1d25055ea2c4178c77c9.256p.jpg",
  memory: "https://cdna.pcpartpicker.com/static/forever/images/product/0161407080353d18971dcccd15dc3722.256p.jpg",
  storage: "https://cdna.pcpartpicker.com/static/forever/images/product/8a0df381931efb7323f458cfc42260f8.256p.jpg",
  networking: "/hardware/networking.jpg",
  monitors: "/hardware/monitor.jpg",
  keyboards: "/hardware/keyboard.jpg",
  mice: "/hardware/mouse.jpg",
  headsets: "/hardware/headset.jpg",
  webcams: "/hardware/webcam.jpg",
  speakers: "/hardware/speakers.jpg",
  ups: "/hardware/ups.jpg",
  "external-storage": "/hardware/external-storage.jpg",
};

export default function HomePage() {
  return (
    <div className="space-y-16 py-6 sm:py-12">
      {/* Hero Section */}
      <section className="container-shell grid min-h-[500px] items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Álbum de Hardware con Datos Reales
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl sm:leading-[1.1]">
            Compara componentes con <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">precisión y criterio.</span>
          </h1>

          <p className="max-w-xl text-base sm:text-lg leading-relaxed text-slate-300">
            Explora más de 47,000 componentes de hardware verificados con fotografías de alta resolución, precios actualizados y especificaciones lado a lado.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/products" className="button-primary text-sm font-black px-6 py-3">
              Explorar catálogo completo →
            </Link>
            <Link href="/compare" className="button-secondary text-sm font-bold px-6 py-3">
              Abrir comparador
            </Link>
          </div>
        </div>

        {/* Feature Interactive Card */}
        <div className="panel relative overflow-hidden p-8 border border-slate-800/80 bg-slate-900/50">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

          <p className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-6">
            Flujo inteligente de comparación
          </p>

          <ol className="relative space-y-4">
            {[
              { title: "Explora o filtra", desc: "Selecciona por categoría (CPU, GPU, Monitores, Periféricos)." },
              { title: "Agrega con un clic", desc: "Pulsa '+ Comparar' en cualquier tarjeta directamente." },
              { title: "Compara hasta 3 modelos", desc: "Visualiza diferencias destacadas, mejor precio y veredicto." },
            ].map((step, index) => (
              <li key={step.title} className="flex items-start gap-4 p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 font-black text-slate-950 text-sm shadow-md shadow-cyan-500/20">
                  {index + 1}
                </span>
                <div>
                  <h2 className="text-sm font-bold text-white">{step.title}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Categories Showcase with Real Photos */}
      <section className="border-y border-slate-800/80 bg-slate-950/60 py-16">
        <div className="container-shell space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Categorías verificadas</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-black text-white">Componentes internos y periféricos</h2>
            </div>
            <Link href="/products" className="text-xs font-bold text-cyan-400 hover:text-cyan-300">
              Ver todas las categorías →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {HARDWARE_CATEGORIES.filter((item) => item.value).map((cat) => {
              const imageSrc = CATEGORY_IMAGES[cat.value];
              return (
                <Link
                  key={cat.value}
                  href={`/products?source=hardware&category=${cat.value}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10"
                >
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-950/80 border border-slate-800/60 mb-3 flex items-center justify-center">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={cat.label}
                        fill
                        sizes="(max-width: 640px) 100vw, 25vw"
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-xs text-slate-600">Hardware</span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-100 group-hover:text-cyan-300 transition-colors text-sm">
                      {cat.label}
                    </h3>
                    <span className="mt-1 block text-xs text-slate-400">Ver modelos y comparar →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
