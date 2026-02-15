import express from "express";
import cors from "cors";
import multer from "multer";

import uploadRoutes from "./routes/upload.routes.js";
import contentRoutes from "./routes/content.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

// ---------------------------
// Global Middlewares
// ---------------------------
app.use(cors());
app.use(express.json());

// ---------------------------
// Routes
// ---------------------------
app.use("/api", uploadRoutes);
app.use("/api", contentRoutes);
app.use("/api/auth", authRoutes);

// ---------------------------
// Multer / File Upload Errors
// ---------------------------
app.use((err, req, res, next) => {
  // Multer-specific errors (file too large, etc.)
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: err.message,
    });
  }

  // Custom fileFilter errors
  if (err instanceof Error) {
    return res.status(400).json({
      message: err.message,
    });
  }

  next(err);
});

export default app;
