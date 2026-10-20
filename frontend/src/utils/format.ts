export function formatPrice(value?: number, currency = "USD"): string {
  if (value === undefined) return "No disponible";
  return new Intl.NumberFormat("es-GT", { style: "currency", currency }).format(value);
}

export function labelFromKey(key: string): string {
  return key.replaceAll("_", " ").replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

