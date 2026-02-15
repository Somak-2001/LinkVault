import multer from "multer";

/**
 * Multer configuration
 * - Uses memory storage (required for Cloudinary)
 * - Enforces file size limit
 * - Does NOT strictly block MIME types
 *
 * Reason:
 * Browsers often send inconsistent MIME types
 * (e.g. CSV, PPTX, PDF, images)
 */
const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },

  fileFilter: (req, file, cb) => {
    // 🔍 Debug log (safe to remove later)
    console.log("📦 Multer received:", {
      mimetype: file.mimetype,
      originalName: file.originalname,
    });

    // ✅ Accept file and let Cloudinary validate
    cb(null, true);
  },
});

export default upload;
