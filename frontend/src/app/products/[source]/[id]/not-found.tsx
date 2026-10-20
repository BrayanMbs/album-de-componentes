import { StatusPanel } from "@/components/ui/status-panel";

export default function ProductNotFound() {
  return <section className="container-shell py-20"><StatusPanel title="Producto no encontrado" message="El producto solicitado no existe o dejó de estar disponible." actionHref="/products" actionLabel="Volver al catálogo" /></section>;
}

