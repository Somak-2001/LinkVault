import express from "express";
import { getContent } from "../controllers/content.controller.js";
import path from "path";
import Content from "../models/Content.js";

const router = express.Router();

router.get("/content/:id", getContent);

// NEW: explicit download endpoint
router.get("/content/:id/download", async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content || content.type !== "file") {
      return res.status(404).end();
    }

    const filePath = path.resolve("uploads", content.fileName);
    return res.download(filePath);
  } catch {
    return res.status(404).end();
  }
});

export default router;
