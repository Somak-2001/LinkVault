import express from "express";
import multer from "multer";
import path from "path";
import { uploadHandler } from "../controllers/upload.controller.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("file"), uploadHandler);

export default router;
