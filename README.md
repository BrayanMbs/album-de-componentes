# PC Compare

Aplicación web universitaria para consultar y comparar equipos de cómputo y
productos tecnológicos usando un contrato de datos uniforme.

## Objetivo y alcance actual

La aplicación funciona como un álbum de hardware con modelos reales: incluye
componentes internos y externos, múltiples marcas por categoría, ilustraciones,
precios históricos en USD y características sobresalientes. Permite seleccionar hasta tres
productos de distintas marcas y recomienda una alternativa con una regla
transparente de calificación y precio. DummyJSON se conserva como catálogo
tecnológico secundario. No incluye compras ni pagos.

## Tecnologías

- Frontend: Next.js App Router, React, TypeScript estricto, Tailwind CSS y Redux Toolkit.
- Backend: Node.js, Express, TypeScript estricto, Zod, Helmet, CORS y dotenv.
- Infraestructura local: Docker y Docker Compose.
- Fuente principal con fotografías reales: [PCPartPicker Parts Dataset](https://huggingface.co/datasets/cdh-01/pcpartpicker-parts-dataset),
  dataset abierto (MIT) con 47 878 registros que incluye URLs de imágenes reales, marcas, precios y especificaciones
  para CPU, GPU, motherboard, RAM, almacenamiento, fuentes, disipadores y gabinetes.
- Fuente complementaria para periféricos: [PC Part Dataset](https://github.com/docyx/pc-part-dataset),
  para categorías externas como monitores, teclados, mouse y audífonos.
- Fuente secundaria: [DummyJSON](https://dummyjson.com/).

## Arquitectura

```text
Navegador
   │
   ▼
Next.js (UI + Redux para comparación)
   │
   ▼
Express BFF (validación, timeout, caché, normalización)
   │
   ▼
DummyJSON / futuros proveedores
```

El frontend solo conoce `NormalizedProduct`. El catálogo de hardware se consulta
desde GitHub Raw exclusivamente a través del adapter del backend, se valida con
Zod y se guarda durante una hora en memoria. Cada proveedor tiene un adapter y
un mapper en el backend, evitando que los cambios de una API externa se propaguen
a la interfaz. Las respuestas externas se validan con Zod y se almacenan durante
cinco minutos en una caché en memoria reemplazable en el futuro.

## Estructura

```text
pc-compare/
├── backend/
│   └── src/{adapters,config,controllers,mappers,middleware,models,routes,schemas,services,utils}
├── frontend/
│   └── src/{app,components,constants,services,store,types,utils}
├── compose.yaml
└── README.md
```

## Ejecución con Docker Compose

Requisito: Docker Desktop o Docker Engine con Compose.

```bash
docker compose up --build
```

- Aplicación: http://localhost:3000
- API: http://localhost:4000
- Healthcheck: http://localhost:4000/api/health

Para detener los contenedores:

```bash
docker compose down
```

`BESTBUY_API_KEY` es opcional y no se usa todavía. Si se define en el entorno
antes de iniciar Compose, se pasa exclusivamente al backend.

## Ejecución sin Docker

Usar Node.js 22 o posterior.

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

En otra terminal:

```bash
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

En macOS/Linux se puede sustituir `copy` por `cp`.

## Variables de entorno

Backend (`backend/.env`):

| Variable | Valor predeterminado | Descripción |
|---|---:|---|
| `PORT` | `4000` | Puerto de Express |
| `FRONTEND_URL` | `http://localhost:3000` | Origen permitido por CORS |
| `EXTERNAL_API_TIMEOUT_MS` | `8000` | Timeout de proveedores |
| `DUMMYJSON_CACHE_TTL_MS` | `300000` | TTL de caché en memoria |
| `BESTBUY_API_KEY` | vacío | Integración futura opcional |

Frontend (`frontend/.env.local`):

| Variable | Valor predeterminado | Descripción |
|---|---:|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | URL pública del BFF |
| `API_INTERNAL_URL` | `http://localhost:4000` | URL del BFF para render del servidor |

No se deben usar prefijos `NEXT_PUBLIC_` para secretos.

## Endpoints implementados

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/health` | Estado del servicio |
| GET | `/api/products` | Catálogo con `q`, `category`, `source`, `placement`, `page`, `limit`, `sort` |
| GET | `/api/products/:source/:id` | Detalle normalizado |

El filtro `source=hardware` muestra únicamente componentes de cómputo y es el
valor predeterminado. `placement` admite `internal` o `external`. Valores de
`sort`: `price-asc`, `price-desc`, `rating-desc`.

## Comandos de calidad

```bash
npm --prefix frontend run lint
npm --prefix frontend run build
npm --prefix backend run typecheck
npm --prefix backend run build
```

## Limitaciones y fase 2

- Los precios del álbum son observaciones históricas reales del dataset, no cotizaciones comerciales en tiempo real.
- CPU, GPU, motherboards, RAM, almacenamiento interno, fuentes, refrigeración y
  gabinetes usan fotografías reales enlazadas por el
  [PCPartPicker Parts Dataset](https://huggingface.co/datasets/cdh-01/pcpartpicker-parts-dataset).
  Las categorías externas que no incluyen fotografía conservan una ilustración
  claramente identificada para no asociar una imagen incorrecta al modelo.
- DummyJSON es una fuente de demostración; sus precios, stock y productos tampoco son comerciales en tiempo real.
- La selección de comparación vive en memoria y se reinicia al recargar la página.
- GPU Specs, `/api/gpus`, categorías del backend, `POST /api/compare` y Best Buy quedan para la segunda fase.
- La caché es local a cada proceso; Redis puede reemplazarla al escalar horizontalmente.
- No se infieren especificaciones que la fuente no entregue.

