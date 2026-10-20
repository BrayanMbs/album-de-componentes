import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error.js";

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      status: 400,
      error: "Bad Request",
      message: "Invalid request data",
      details: error.issues,
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.status).json({
      status: error.status,
      error: error.error,
      message: error.message,
      ...(error.details !== undefined ? { details: error.details } : {}),
    });
    return;
  }

  res.status(500).json({ status: 500, error: "Internal Server Error", message: "An unexpected error occurred" });
};

