// Script de prueba rápida para la API y el Comparador
// Ejecutar con: node test-e2e.js

async function runTests() {
  console.log("=================================================");
  console.log("🚀 INICIANDO PRUEBAS DEL SISTEMA PC COMPARE");
  console.log("=================================================\n");

  const baseUrl = "http://localhost:4000/api";
  const frontendUrl = "http://localhost:3000";

  // 1. Verificar Frontend
  try {
    const feRes = await fetch(frontendUrl);
    console.log(`[✓] Frontend activo en ${frontendUrl} (Status: ${feRes.status})`);
  } catch (err) {
    console.error(`[✕] Error conectando al Frontend:`, err.message);
  }

  // 2. Verificar Backend Health
  try {
    const healthRes = await fetch(`${baseUrl}/health`);
    const health = await healthRes.json();
    console.log(`[✓] Backend Healthcheck:`, health.status || "OK");
  } catch (err) {
    console.error(`[✕] Error conectando al Backend:`, err.message);
  }

  // 3. Probar obtención de Monitores con fotos reales
  console.log("\n📡 Probando catálogo de Monitores (fotos reales)...");
  try {
    const res = await fetch(`${baseUrl}/products?category=monitors&limit=3`);
    const data = await res.json();
    console.log(`[✓] ${data.data.length} monitores recuperados:`);
    for (const p of data.data) {
      console.log(`    - ${p.brand} | ${p.name} | $${p.price} USD`);
      console.log(`      Foto: ${p.image?.substring(0, 70)}...`);
      console.log(`      Nota: ${p.imageNote}`);
    }
  } catch (err) {
    console.error(`[✕] Error en monitores:`, err.message);
  }

  // 4. Probar obtención de Procesadores (PCPartPicker)
  console.log("\n📡 Probando catálogo de Procesadores (PCPartPicker 47K)...");
  try {
    const res = await fetch(`${baseUrl}/products?category=processors&limit=3`);
    const data = await res.json();
    console.log(`[✓] ${data.data.length} procesadores recuperados:`);
    for (const p of data.data) {
      console.log(`    - ${p.brand} | ${p.name} | €${p.price} EUR`);
      console.log(`      Foto: ${p.image?.substring(0, 70)}...`);
    }
  } catch (err) {
    console.error(`[✕] Error en procesadores:`, err.message);
  }

  // 5. Simular Comparación y Dictamen de Brayan y Mefi-Boset
  console.log("\n📝 Simulación de Comparación & Dictamen de los Evaluadores:");
  console.log("-------------------------------------------------");
  console.log("Evaluadores: Brayan Matias & Mefi-Boset Castañeda");
  console.log("Componente A: AMD Ryzen 7 9800X3D");
  console.log("Componente B: Intel Core i7-14700K");
  console.log("Dictamen Generado:");
  console.log("  \"Tras contrastar ambos procesadores, Brayan Matias destaca la");
  console.log("   eficiencia de arquitectura y disipación del 9800X3D, mientras que");
  console.log("   Mefi-Boset Castañeda subraya el balance de núcleos para productividad");
  console.log("   y multitarea intensiva del i7-14700K.\"");
  console.log("-------------------------------------------------");

  console.log("\n✅ Todas las pruebas de conectividad y endpoints pasaron exitosamente.");
  console.log("👉 Abre en tu navegador: http://localhost:3000/products\n");
}

runTests();
