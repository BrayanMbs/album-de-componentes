import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { env } from "../../config/env.js";
import type { NormalizedProduct, ProductSpecifications } from "../../models/product.js";
import { AppError } from "../../utils/app-error.js";
import { MemoryCache } from "../../utils/memory-cache.js";

const DATASET_BASE_URL = "https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json";
const DATASET_PAGE_URL = "https://github.com/docyx/pc-part-dataset";
const DATASET_UPDATED_AT = "2025-07-23";
const IMAGE_DATASET_URL = "https://huggingface.co/datasets/cdh-01/pcpartpicker-parts-dataset/resolve/main/pcpartpicker_parts.jsonl?download=true";
const IMAGE_DATASET_UPDATED_AT = "2026-05-12";
const CACHE_TTL_MS = 60 * 60 * 1000;
const cache = new MemoryCache();

const rawPartSchema = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative().nullable(),
}).catchall(z.unknown());

type RawPart = z.infer<typeof rawPartSchema>;

const imagePartSchema = z.object({
  brand: z.string().min(1),
  category: z.string().min(1),
  image_url: z.string().url(),
  name: z.string().min(1),
  price_eur: z.number().nonnegative().nullable(),
  rating_count: z.number().int().nonnegative().nullable().optional(),
  source_id: z.union([z.string(), z.number()]).transform(String),
  specs: z.record(z.string(), z.unknown()),
  url: z.string().url(),
});

type ImagePart = z.infer<typeof imagePartSchema>;
type Placement = "internal" | "external";

interface CategoryConfig {
  category: string;
  datasetKey: string;
  placement: Placement;
  image: string;
}

const CATEGORY_CONFIGS: CategoryConfig[] = [
  { category: "processors", datasetKey: "cpu", placement: "internal", image: "/hardware/processor.svg" },
  { category: "graphics-cards", datasetKey: "video-card", placement: "internal", image: "/hardware/graphics-card.svg" },
  { category: "motherboards", datasetKey: "motherboard", placement: "internal", image: "/hardware/motherboard.svg" },
  { category: "memory", datasetKey: "memory", placement: "internal", image: "/hardware/memory.svg" },
  { category: "storage", datasetKey: "internal-hard-drive", placement: "internal", image: "/hardware/storage.svg" },
  { category: "power-supplies", datasetKey: "power-supply", placement: "internal", image: "/hardware/power.svg" },
  { category: "cooling", datasetKey: "cpu-cooler", placement: "internal", image: "/hardware/cooling.svg" },
  { category: "cases", datasetKey: "case", placement: "internal", image: "/hardware/case.svg" },
  { category: "networking", datasetKey: "wireless-network-card", placement: "internal", image: "/hardware/networking.jpg" },
  { category: "monitors", datasetKey: "monitor", placement: "external", image: "/hardware/monitor.jpg" },
  { category: "keyboards", datasetKey: "keyboard", placement: "external", image: "/hardware/keyboard.jpg" },
  { category: "mice", datasetKey: "mouse", placement: "external", image: "/hardware/mouse.jpg" },
  { category: "headsets", datasetKey: "headphones", placement: "external", image: "/hardware/headset.jpg" },
  { category: "webcams", datasetKey: "webcam", placement: "external", image: "/hardware/webcam.jpg" },
  { category: "speakers", datasetKey: "speakers", placement: "external", image: "/hardware/speakers.jpg" },
  { category: "ups", datasetKey: "ups", placement: "external", image: "/hardware/ups.jpg" },
  { category: "external-storage", datasetKey: "external-hard-drive", placement: "external", image: "/hardware/external-storage.jpg" },
];

const IMAGE_DATASET_CATEGORIES = new Set([
  "cpu", "cpu-cooler", "motherboard", "memory", "internal-hard-drive",
  "video-card", "power-supply", "case",
]);

const KNOWN_BRANDS = [
  "Western Digital", "Cooler Master", "Fractal Design", "be quiet!", "G.Skill",
  "Thermaltake", "Silverstone", "TeamGroup", "Seagate", "Kingston", "Corsair",
  "Samsung", "Crucial", "Logitech", "Microsoft", "ASRock", "Gigabyte", "Sapphire",
];

export interface HardwareListOptions {
  q?: string;
  category?: string;
  placement?: Placement;
  page: number;
  limit: number;
  sort?: "price-asc" | "price-desc" | "rating-desc";
}

function productId(datasetKey: string, name: string): string {
  const hash = createHash("sha1").update(name).digest("hex").slice(0, 14);
  return `${datasetKey}-${hash}`;
}

function extractBrand(name: string): string {
  return KNOWN_BRANDS.find((brand) => name.toLocaleLowerCase("en").startsWith(brand.toLocaleLowerCase("en")))
    ?? name.split(" ")[0]
    ?? "Marca no identificada";
}

function normalizeSpecificationValue(value: unknown): string | number | boolean | undefined {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map(String).join(" × ");
  return undefined;
}

function interleaveBrandsByCategory(products: NormalizedProduct[]): NormalizedProduct[] {
  const byCategory = new Map<string, NormalizedProduct[]>();
  for (const product of products) {
    const current = byCategory.get(product.category) ?? [];
    current.push(product);
    byCategory.set(product.category, current);
  }

  return Array.from(byCategory.values()).flatMap((categoryProducts) => {
    const byBrand = new Map<string, NormalizedProduct[]>();
    for (const product of categoryProducts) {
      const brand = product.brand ?? "unknown";
      const current = byBrand.get(brand) ?? [];
      current.push(product);
      byBrand.set(brand, current);
    }
    const groups = Array.from(byBrand.values());
    const interleaved: NormalizedProduct[] = [];
    const largestGroup = Math.max(...groups.map((group) => group.length));
    for (let index = 0; index < largestGroup; index += 1) {
      for (const group of groups) {
        const product = group[index];
        if (product) interleaved.push(product);
      }
    }
    return interleaved;
  });
}

let peripheralImagesMap: Record<string, string> | null = null;
function getCachedPeripheralImage(name: string): string | undefined {
  if (!peripheralImagesMap) {
    const localCandidates = [
      fileURLToPath(new URL("../../../data/peripheral_images.json", import.meta.url)),
      path.resolve(process.cwd(), "data", "peripheral_images.json"),
      path.resolve(process.cwd(), "backend", "data", "peripheral_images.json"),
    ];
    for (const candidate of localCandidates) {
      if (fs.existsSync(candidate)) {
        try {
          peripheralImagesMap = JSON.parse(fs.readFileSync(candidate, "utf-8"));
          break;
        } catch {
          // ignore
        }
      }
    }
    if (!peripheralImagesMap) peripheralImagesMap = {};
  }
  return peripheralImagesMap[name];
}

function mapPart(part: RawPart, config: CategoryConfig): NormalizedProduct {
  const specifications: ProductSpecifications = { placement: config.placement };
  for (const [key, value] of Object.entries(part)) {
    if (key === "name" || key === "price") continue;
    const normalized = normalizeSpecificationValue(value);
    if (normalized !== undefined) specifications[key] = normalized;
  }

  const externalId = productId(config.datasetKey, part.name);
  const realImage = getCachedPeripheralImage(part.name);
  const image = realImage || config.image;
  const imageNote = realImage
    ? "Fotografía real del modelo específico del producto."
    : "Fotografía de referencia de estudio para esta categoría de producto.";

  return {
    id: `hardware-${externalId}`,
    externalId,
    source: "hardware",
    name: part.name,
    description: `Producto real registrado en el dataset abierto PC Part Dataset para la categoría ${config.category.replaceAll("-", " ")}.`,
    brand: extractBrand(part.name),
    category: config.category,
    ...(part.price !== null ? { price: part.price, currency: "USD" } : {}),
    image,
    images: [image],
    availability: "Registro histórico del dataset",
    specifications,
    dataSource: "PC Part Dataset / PCPartPicker",
    sourceUrl: DATASET_PAGE_URL,
    dataUpdatedAt: DATASET_UPDATED_AT,
    imageNote,
  };
}

function mapImagePart(part: ImagePart, config: CategoryConfig): NormalizedProduct {
  const specifications: ProductSpecifications = { placement: config.placement };
  for (const [key, value] of Object.entries(part.specs)) {
    const normalized = normalizeSpecificationValue(value);
    if (normalized !== undefined) specifications[key] = normalized;
  }
  if (part.rating_count !== null && part.rating_count !== undefined) specifications.ratingCount = part.rating_count;

  const externalId = `pcpartpicker-${part.source_id}`;
  return {
    id: `hardware-${externalId}`,
    externalId,
    source: "hardware",
    name: part.name,
    description: `Producto real de ${part.brand} registrado en el dataset público de PCPartPicker.`,
    brand: part.brand,
    category: config.category,
    ...(part.price_eur !== null ? { price: part.price_eur, currency: "EUR" } : {}),
    image: part.image_url,
    images: [part.image_url],
    availability: "Registro del catálogo europeo de PCPartPicker",
    specifications,
    dataSource: "PCPartPicker Parts Dataset (Hugging Face)",
    sourceUrl: part.url,
    dataUpdatedAt: IMAGE_DATASET_UPDATED_AT,
    imageNote: "Fotografía enlazada por el dataset; pertenece a su proveedor de origen.",
  };
}

async function loadDatasetText(): Promise<string> {
  const localCandidates = [
    fileURLToPath(new URL("../../../data/pcpartpicker_parts.jsonl", import.meta.url)),
    path.resolve(process.cwd(), "data", "pcpartpicker_parts.jsonl"),
    path.resolve(process.cwd(), "backend", "data", "pcpartpicker_parts.jsonl"),
  ];
  for (const candidate of localCandidates) {
    if (fs.existsSync(candidate)) {
      return fs.promises.readFile(candidate, "utf-8");
    }
  }

  const response = await fetch(IMAGE_DATASET_URL, {
    signal: AbortSignal.timeout(Math.max(env.EXTERNAL_API_TIMEOUT_MS, 30_000)),
    headers: { Accept: "application/x-ndjson", "User-Agent": "pc-compare-academic-project" },
  });
  if (!response.ok) throw new AppError(502, "Bad Gateway", `Image dataset returned ${response.status}`);
  const text = await response.text();
  try {
    const saveTarget = path.resolve(process.cwd(), "data", "pcpartpicker_parts.jsonl");
    const parentDir = path.dirname(saveTarget);
    if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });
    await fs.promises.writeFile(saveTarget, text, "utf-8");
  } catch {
    // Non-blocking caching attempt
  }
  return text;
}

async function fetchImageDataset(): Promise<NormalizedProduct[]> {
  const cacheKey = "pcpartpicker-image-dataset";
  const cached = cache.get<NormalizedProduct[]>(cacheKey);
  if (cached) return cached;

  try {
    const text = await loadDatasetText();
    const products: NormalizedProduct[] = [];

    for (const line of text.split("\n")) {
      if (!line.trim()) continue;
      try {
        const parsed = imagePartSchema.safeParse(JSON.parse(line) as unknown);
        if (!parsed.success || parsed.data.price_eur === null) continue;
        const config = CATEGORY_CONFIGS.find((candidate) => candidate.datasetKey === parsed.data.category);
        if (config) products.push(mapImagePart(parsed.data, config));
      } catch {
        continue;
      }
    }

    if (products.length === 0) throw new AppError(502, "Bad Gateway", "Image dataset did not contain valid products");
    cache.set(cacheKey, products, CACHE_TTL_MS);
    return products;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new AppError(504, "Gateway Timeout", "Image dataset timed out");
    }
    throw new AppError(502, "Bad Gateway", "Unable to reach the image dataset");
  }
}

async function fetchCategory(config: CategoryConfig): Promise<NormalizedProduct[]> {
  const cached = cache.get<NormalizedProduct[]>(config.datasetKey);
  if (cached) return cached;

  try {
    const response = await fetch(`${DATASET_BASE_URL}/${config.datasetKey}.json`, {
      signal: AbortSignal.timeout(env.EXTERNAL_API_TIMEOUT_MS),
      headers: { Accept: "application/json", "User-Agent": "pc-compare-academic-project" },
    });
    if (!response.ok) throw new AppError(502, "Bad Gateway", `Hardware dataset returned ${response.status}`);
    const parsed = z.array(rawPartSchema).safeParse(await response.json());
    if (!parsed.success) throw new AppError(502, "Bad Gateway", "Hardware dataset returned invalid data");
    const products = parsed.data.filter((part) => part.price !== null).map((part) => mapPart(part, config));
    cache.set(config.datasetKey, products, CACHE_TTL_MS);
    return products;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new AppError(504, "Gateway Timeout", "Hardware dataset timed out");
    }
    throw new AppError(502, "Bad Gateway", "Unable to reach the hardware dataset");
  }
}

export class HardwareAdapter {
  async list(options: HardwareListOptions): Promise<{ products: NormalizedProduct[]; total: number }> {
    const configs = CATEGORY_CONFIGS.filter((config) =>
      (!options.category || config.category === options.category)
      && (!options.placement || config.placement === options.placement));
    if (options.category && configs.length === 0) return { products: [], total: 0 };

    const imageConfigs = configs.filter((config) => IMAGE_DATASET_CATEGORIES.has(config.datasetKey));
    const rawConfigs = configs.filter((config) => !IMAGE_DATASET_CATEGORIES.has(config.datasetKey));
    const requests: Promise<NormalizedProduct[]>[] = [];
    if (imageConfigs.length > 0) {
      const requestedKeys = new Set(imageConfigs.map((config) => config.datasetKey));
      requests.push(fetchImageDataset().then((items) => items.filter((item) => {
        const config = CATEGORY_CONFIGS.find((candidate) => candidate.category === item.category);
        return config ? requestedKeys.has(config.datasetKey) : false;
      })));
    }
    requests.push(...rawConfigs.map(fetchCategory));

    const settled = await Promise.allSettled(requests);
    let products = settled.flatMap((result) => result.status === "fulfilled" ? result.value : []);
    if (products.length === 0 && settled.some((result) => result.status === "rejected")) {
      throw new AppError(502, "Bad Gateway", "No hardware dataset category is currently available");
    }

    const query = options.q?.toLocaleLowerCase("es") ?? "";
    if (query) products = products.filter((product) => `${product.name} ${product.brand ?? ""}`.toLocaleLowerCase("es").includes(query));
    if (options.sort === "price-asc") products = [...products].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (options.sort === "price-desc") products = [...products].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    if (!options.sort) products = interleaveBrandsByCategory(products);

    const total = products.length;
    const offset = (options.page - 1) * options.limit;
    return { products: products.slice(offset, offset + options.limit), total };
  }

  async getById(id: string): Promise<NormalizedProduct> {
    const cleanId = id.startsWith("hardware-") ? id.replace(/^hardware-/, "") : id;
    if (cleanId.startsWith("pcpartpicker-")) {
      const product = (await fetchImageDataset()).find((item) => item.externalId === cleanId);
      if (!product) throw new AppError(404, "Not Found", "Hardware component not found");
      return product;
    }
    const config = CATEGORY_CONFIGS.find((candidate) => cleanId.startsWith(`${candidate.datasetKey}-`));
    if (!config) throw new AppError(404, "Not Found", "Hardware component not found");
    const product = (await fetchCategory(config)).find((item) => item.externalId === cleanId);
    if (!product) throw new AppError(404, "Not Found", "Hardware component not found");
    return product;
  }
}
