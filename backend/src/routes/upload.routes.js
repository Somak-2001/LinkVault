import express from "express";
import upload from "../utils/multer.js";
import { uploadHandler } from "../controllers/upload.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Use memory-based Multer (required for Cloudinary)
// optionalAuth allows both authenticated and guest uploads
router.post("/upload", optionalAuth, upload.single("file"), uploadHandler);

export default router;
