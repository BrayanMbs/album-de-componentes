"use client";

import { useState, useEffect, useCallback } from "react";
import type { NormalizedProduct } from "@/types/product";
import { formatPrice } from "@/utils/format";

interface TeamEvaluationProps {
  products: NormalizedProduct[];
  category?: string;
  minPrice: number | null;
  maxPrice: number | null;
  cheapestProduct?: NormalizedProduct | null;
  recommended?: NormalizedProduct | null;
}

interface ProductOpinion {
  summary: string;
  brayanComment: string;
  mefiComment: string;
}

interface EvaluationState {
  globalConclusion: string;
  productOpinions: Record<string, ProductOpinion>;
  isCustom: boolean;
  updatedAt: string;
}

function generateDefaultEvaluation(
  products: NormalizedProduct[],
  cheapestProduct: NormalizedProduct | null | undefined,
  recommended: NormalizedProduct | null | undefined,
  minPrice: number | null,
  maxPrice: number | null
): EvaluationState {
  const priceDiff =
    minPrice !== null && maxPrice !== null && maxPrice > minPrice
      ? maxPrice - minPrice
      : 0;

  const productOpinions: Record<string, ProductOpinion> = {};

  for (const product of products) {
    const isCheapest = cheapestProduct?.id === product.id && products.length > 1;
    const isRec = recommended?.id === product.id && products.length > 1;
    const brand = product.brand ?? "el fabricante";
    const name = product.name;
    const cat = product.category.replaceAll("-", " ");

    let brayanText = "";
    let mefiText = "";
    let summaryText = "";

    if (isCheapest) {
      summaryText = `Opción más económica y accesible del grupo (${formatPrice(product.price, product.currency)}). Excelente relación costo-beneficio para presupuestos ajustados.`;
      brayanText = `Desde el punto de vista de construcción y costo de materiales, ${name} de ${brand} optimiza eficientemente los costos de fabricación sin comprometer las especificaciones esenciales para su categoría (${cat}). Es ideal si el objetivo principal es maximizar el presupuesto total del equipo.`;
      mefiText = `En términos de rendimiento por cada unidad monetaria invertida, este modelo cumple de forma sólida en entornos de trabajo estándar y académicos. Si bien no busca batir récords en cargas extremas, su estabilidad operativa y disponibilidad lo convierten en una alternativa sumamente sensata.`;
    } else if (isRec) {
      summaryText = `Elección predilecta por equilibrio integral. Destaca por balance entre prestaciones técnicas, confiabilidad y valor general.`;
      brayanText = `Analizando la arquitectura de componentes y la calidad de ensamble de ${brand}, este producto ofrece una ingeniería más robusta con mejores tolerancias operativas, disipación y fiabilidad a mediano y largo plazo.`;
      mefiText = `En nuestras pruebas y contraste técnico frente a los otros modelos, es la opción que mejor responde a flujos de trabajo demandantes. Ofrece un equilibrio óptimo entre prestaciones brutas y retorno de inversión, siendo nuestra recomendación principal.`;
    } else {
      summaryText = `Alternativa competitiva de ${brand} con prestaciones diferenciadas orientadas a usuarios que valoran características específicas.`;
      brayanText = `Presenta un diseño interesante por parte de ${brand}. La distribución de puertos, conectores y empaquetado térmico demuestran un estándar de calidad elevado acorde a su segmento.`;
      mefiText = `Ofrece un desempeño competente en su rango. Si el usuario prioriza el ecosistema de la marca o busca compatibilidad directa con una configuración preexistente, es una opción a tomar muy en cuenta.`;
    }

    productOpinions[product.id] = {
      summary: summaryText,
      brayanComment: brayanText,
      mefiComment: mefiText,
    };
  }

  const recName = recommended?.name ?? products[0]?.name ?? "este componente";
  const cheapName = cheapestProduct?.name ?? products[0]?.name;

  const globalConclusion =
    products.length === 1
      ? `Dictamen técnico preliminar: El componente analizado (${products[0].name}) presenta especificaciones coherentes con su segmento. Para una valoración comparativa integral, se recomienda contrastarlo con al menos un modelo competidor de otra marca.`
      : `Tras evaluar los ${products.length} productos frente a frente, nuestro dictamen técnico concluye que la alternativa con mejor equilibrio global es "${recName}". ` +
        (priceDiff > 0 && cheapName && cheapestProduct
          ? `Para proyectos con restricciones estrictas de presupuesto, "${cheapName}" representa la alternativa más eficiente económicamente con un ahorro de ${formatPrice(priceDiff, cheapestProduct.currency)}. `
          : "") +
        `En conclusión, ambos evaluadores concordamos en que la decisión final dependerá de si se prioriza el costo mínimo de adquisición o la solidez en flujos de trabajo intensivos.`;

  return {
    globalConclusion,
    productOpinions,
    isCustom: false,
    updatedAt: new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
}

export function TeamEvaluation({
  products,
  category,
  minPrice,
  maxPrice,
  cheapestProduct,
  recommended,
}: TeamEvaluationProps) {
  const cacheKey = `team_eval_${products.map((p) => p.id).sort().join("_")}`;

  const [evaluation, setEvaluation] = useState<EvaluationState>(() =>
    generateDefaultEvaluation(products, cheapestProduct, recommended, minPrice, maxPrice)
  );
  const [isEditing, setIsEditing] = useState(false);
  const [draftGlobal, setDraftGlobal] = useState("");
  const [draftOpinions, setDraftOpinions] = useState<Record<string, ProductOpinion>>({});
  const [copied, setCopied] = useState(false);

  // Load persisted custom review from localStorage if exists
  useEffect(() => {
    try {
      const stored = localStorage.getItem(cacheKey);
      if (stored) {
        const parsed = JSON.parse(stored) as EvaluationState;
        setEvaluation(parsed);
        return;
      }
    } catch {
      // ignore localStorage parse errors
    }
    setEvaluation(
      generateDefaultEvaluation(products, cheapestProduct, recommended, minPrice, maxPrice)
    );
  }, [cacheKey, products, cheapestProduct, recommended, minPrice, maxPrice]);

  const handleStartEdit = () => {
    setDraftGlobal(evaluation.globalConclusion);
    setDraftOpinions(JSON.parse(JSON.stringify(evaluation.productOpinions)));
    setIsEditing(true);
  };

  const handleSave = () => {
    const updated: EvaluationState = {
      globalConclusion: draftGlobal,
      productOpinions: draftOpinions,
      isCustom: true,
      updatedAt: new Date().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
    setEvaluation(updated);
    setIsEditing(false);
    try {
      localStorage.setItem(cacheKey, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
  };

  const handleResetToDefault = () => {
    const fresh = generateDefaultEvaluation(
      products,
      cheapestProduct,
      recommended,
      minPrice,
      maxPrice
    );
    setEvaluation(fresh);
    setIsEditing(false);
    try {
      localStorage.removeItem(cacheKey);
    } catch {
      // ignore storage errors
    }
  };

  const handleCopyReport = useCallback(() => {
    let report = `========================================================\n`;
    report += `INFORME Y DICTAMEN TÉCNICO DE COMPARACIÓN DE HARDWARE\n`;
    report += `Evaluadores: Brayan Matias & Mefi-Boset Castañeda\n`;
    report += `Categoría: ${category?.replaceAll("-", " ") || "Hardware"}\n`;
    report += `Fecha: ${evaluation.updatedAt}\n`;
    report += `========================================================\n\n`;

    report += `1. DICTAMEN Y CONCLUSIÓN GENERAL DEL EQUIPO:\n`;
    report += `${evaluation.globalConclusion}\n\n`;

    report += `2. EVALUACIÓN DETALLADA POR COMPONENTE:\n`;
    for (const product of products) {
      const op = evaluation.productOpinions[product.id];
      report += `--------------------------------------------------------\n`;
      report += `PRODUCTO: ${product.name} (${product.brand ?? "Marca no indicada"})\n`;
      report += `PRECIO REGISTRADO: ${formatPrice(product.price, product.currency)}\n`;
      if (op) {
        report += `Resumen Técnico: ${op.summary}\n`;
        report += `Opinión de Brayan Matias (Hardware & Ensamble):\n  "${op.brayanComment}"\n`;
        report += `Opinión de Mefi-Boset Castañeda (Arquitectura & Rendimiento):\n  "${op.mefiComment}"\n`;
      }
      report += `\n`;
    }

    report += `========================================================\n`;
    report += `Firmado por: Brayan Matias & Mefi-Boset Castañeda\n`;

    navigator.clipboard.writeText(report).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [category, evaluation, products]);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-cyan-950/20">
      {/* Decorative ambient background blur */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section with Evaluators credentials */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/40">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Dictamen Oficial de Comparativa
            </span>
            {evaluation.isCustom ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                ✍️ Editado por los evaluadores
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                ✨ Análisis técnico generado
              </span>
            )}
          </div>

          <h2 className="mt-3 text-2xl sm:text-3xl font-black text-white tracking-tight">
            Opinión y Dictamen Técnico del Equipo
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Análisis crítico, balance de arquitectura y veredicto emitido para esta comparativa.
          </p>
        </div>

        {/* Team Members Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center text-slate-950 font-black text-xs shadow-md shadow-cyan-500/30">
              BM
            </div>
            <div>
              <p className="text-xs font-black text-white">Brayan Matias</p>
              <p className="text-[10px] text-cyan-400 font-medium">Evaluador Técnico de Hardware</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-500/30">
              MC
            </div>
            <div>
              <p className="text-xs font-black text-white">Mefi-Boset Castañeda</p>
              <p className="text-[10px] text-indigo-400 font-medium">Arquitectura & Rendimiento</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action toolbar (Edit, Reset, Copy) */}
      <div className="relative z-10 my-6 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-400">
          Última actualización: <span className="font-semibold text-slate-300">{evaluation.updatedAt}</span>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCopyReport}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-all"
                title="Copiar informe completo al portapapeles"
              >
                {copied ? "✓ ¡Copiado!" : "📋 Copiar informe"}
              </button>

              <button
                type="button"
                onClick={handleStartEdit}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-cyan-200 px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 transition-all shadow-sm"
              >
                ✏️ Editar opiniones
              </button>

              {evaluation.isCustom && (
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="text-xs text-slate-500 hover:text-rose-400 px-2 py-1 transition-colors"
                  title="Restablecer al texto generado automáticamente"
                >
                  Restaurar original
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1 text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 px-4 py-2 rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
              >
                💾 Guardar cambios
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global conclusion box */}
      <div className="relative z-10 mb-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            📌 Conclusión General del Equipo
          </span>
          {isEditing && (
            <span className="text-[11px] text-amber-400 font-mono">Modo edición activo</span>
          )}
        </div>

        {isEditing ? (
          <div>
            <textarea
              value={draftGlobal}
              onChange={(e) => setDraftGlobal(e.target.value)}
              rows={4}
              className="w-full text-sm leading-relaxed p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              placeholder="Escribe la conclusión general de la comparación..."
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Puedes redactar libremente el veredicto final que aparecerá firmado por Brayan y Mefi-Boset.
            </p>
          </div>
        ) : (
          <p className="text-sm sm:text-base leading-relaxed text-slate-200 font-normal">
            {evaluation.globalConclusion}
          </p>
        )}
      </div>

      {/* Per-product opinions cards */}
      <div className="relative z-10 space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Evaluación Individualizada por Componente
        </h3>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {products.map((product) => {
            const op = evaluation.productOpinions[product.id] ?? {
              summary: "",
              brayanComment: "",
              mefiComment: "",
            };
            const draftOp = draftOpinions[product.id] ?? op;

            return (
              <div
                key={product.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 backdrop-blur-sm"
              >
                <div>
                  {/* Product title and badge */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800/60">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                      {product.brand ?? "Componente"}
                    </span>
                    <span className="text-xs font-black text-emerald-400">
                      {formatPrice(product.price, product.currency)}
                    </span>
                  </div>

                  <h4 className="mt-2.5 text-sm font-bold text-white line-clamp-2">
                    {product.name}
                  </h4>

                  {/* Summary / Tagline */}
                  <div className="mt-3">
                    {isEditing ? (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">
                          Resumen Técnico
                        </label>
                        <textarea
                          value={draftOp.summary}
                          onChange={(e) =>
                            setDraftOpinions({
                              ...draftOpinions,
                              [product.id]: { ...draftOp, summary: e.target.value },
                            })
                          }
                          rows={2}
                          className="w-full text-xs p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    ) : (
                      <p className="text-xs font-medium text-slate-300 italic bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50">
                        &ldquo;{op.summary}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Brayan Matias comment */}
                  <div className="mt-4 pt-3 border-t border-slate-800/60">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-[9px] font-black text-cyan-300">
                        BM
                      </div>
                      <span className="text-xs font-bold text-cyan-300">
                        Brayan Matias
                      </span>
                      <span className="text-[10px] text-slate-500">Hardware & Materiales</span>
                    </div>

                    {isEditing ? (
                      <textarea
                        value={draftOp.brayanComment}
                        onChange={(e) =>
                          setDraftOpinions({
                            ...draftOpinions,
                            [product.id]: { ...draftOp, brayanComment: e.target.value },
                          })
                        }
                        rows={3}
                        className="w-full text-xs p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400"
                      />
                    ) : (
                      <p className="text-xs leading-relaxed text-slate-300">
                        {op.brayanComment}
                      </p>
                    )}
                  </div>

                  {/* Mefi-Boset Castañeda comment */}
                  <div className="mt-4 pt-3 border-t border-slate-800/60">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-[9px] font-black text-indigo-300">
                        MC
                      </div>
                      <span className="text-xs font-bold text-indigo-300">
                        Mefi-Boset Castañeda
                      </span>
                      <span className="text-[10px] text-slate-500">Arquitectura & Rendimiento</span>
                    </div>

                    {isEditing ? (
                      <textarea
                        value={draftOp.mefiComment}
                        onChange={(e) =>
                          setDraftOpinions({
                            ...draftOpinions,
                            [product.id]: { ...draftOp, mefiComment: e.target.value },
                          })
                        }
                        rows={3}
                        className="w-full text-xs p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-400"
                      />
                    ) : (
                      <p className="text-xs leading-relaxed text-slate-300">
                        {op.mefiComment}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/40 text-[10px] text-slate-500 text-right">
                  Revisión técnica de par
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer signature line */}
      <div className="relative z-10 mt-8 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
        <p>
          Dictamen técnico elaborado para evaluación académica por{" "}
          <strong className="text-slate-300 font-semibold">Brayan Matias</strong> y{" "}
          <strong className="text-slate-300 font-semibold">Mefi-Boset Castañeda</strong>.
        </p>
        <span className="font-mono text-[11px] text-cyan-400/80">
          {products.length} componente{products.length > 1 ? "s" : ""} analizado{products.length > 1 ? "s" : ""}
        </span>
      </div>
    </section>
  );
}
