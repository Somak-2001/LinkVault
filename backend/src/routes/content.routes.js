import express from "express";
import { getContent, forceDownload, getUserContent, deleteContent } from "../controllers/content.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/content/:id", getContent);

// Force download endpoint that triggers save dialog
router.get("/content/:id/download", forceDownload);

// Protected routes
router.get("/user/content", protect, getUserContent);
router.delete("/content/:id", protect, deleteContent);

export default router;
