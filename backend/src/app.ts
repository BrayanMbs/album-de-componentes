import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { healthRouter } from "./routes/health.routes.js";
import { productRouter } from "./routes/product.routes.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, methods: ["GET", "POST"], allowedHeaders: ["Content-Type"] }));
app.use(express.json({ limit: "100kb" }));

app.use("/api/health", healthRouter);
app.use("/api/products", productRouter);

app.use(notFoundHandler);
app.use(errorHandler);

