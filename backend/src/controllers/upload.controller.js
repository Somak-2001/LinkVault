import Content from "../models/Content.js";
import bcrypt from "bcrypt";
import cloudinary from "../config/cloudinary.js";

export const uploadHandler = async (req, res) => {
  try {
    const { text, expiry, password, maxViews } = req.body;
    const file = req.file;

    // ---------------------------
    // Validation
    // ---------------------------
    if (!text && !file) {
      return res.status(400).json({
        message: "Please provide either text or a file",
      });
    }

    if (text && file) {
      return res.status(400).json({
        message: "Only one of text or file is allowed",
      });
    }

    // ---------------------------
    // Expiry handling
    // ---------------------------
    const expiresAt = expiry
      ? new Date(expiry)
      : new Date(Date.now() + 10 * 60 * 1000); // default 10 minutes

    // ---------------------------
    // Password handling (optional)
    // ---------------------------
    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // ---------------------------
    // View count handling (optional)
    // ---------------------------
    let viewsRemaining = null;
    if (maxViews) {
      const parsedViews = Number(maxViews);
      if (isNaN(parsedViews) || parsedViews <= 0) {
        return res.status(400).json({
          message: "maxViews must be a positive number",
        });
      }
      viewsRemaining = parsedViews;
    }

    // ---------------------------
    // File upload to Cloudinary
    // ---------------------------
    let fileUrl = null;
    let cloudinaryPublicId = null;
    let cloudinaryResourceType = null;
    let originalFileName = null;

    if (file) {
      if (!file.buffer) {
        return res.status(400).json({
          message: "File buffer missing",
        });
      }

      originalFileName = file.originalname;

      const base64 = file.buffer.toString("base64");
      const dataUri = `data:${file.mimetype};base64,${base64}`;

      const uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: "linkvault",
        resource_type: "raw", // Use raw for all files to ensure public access
        type: "upload", // Public delivery type
        access_mode: "public", // Explicit public access
        overwrite: true,
        use_filename: true, // Preserve original filename
        unique_filename: false, // Don't generate random filename
      });

      fileUrl = uploadResult.secure_url;
      cloudinaryPublicId = uploadResult.public_id;
      cloudinaryResourceType = uploadResult.resource_type; // image | video | raw
    }

    // ---------------------------
    // Save content in MongoDB
    // ---------------------------
    const content = await Content.create({
      type: text ? "text" : "file",
      text: text || null,
      fileUrl,
      cloudinaryPublicId,
      cloudinaryResourceType,
      originalFileName,
      expiresAt,
      passwordHash,
      viewsRemaining,
      userId: req.user ? req.user._id : null, // Associate with user if logged in
    });

    // ---------------------------
    // Response
    // ---------------------------
    return res.json({
      url: `http://localhost:5173/view/${content._id}`,
    });

  } catch (error) {
    console.error("Upload failed:", error);
    return res.status(500).json({
      message: "Upload failed",
    });
  }
};
