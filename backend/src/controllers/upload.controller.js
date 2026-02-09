import Content from "../models/Content.js";

export const uploadHandler = async (req, res) => {
  try {
    const { text, expiry } = req.body;
    const file = req.file;

    // Validation: either text or file must be present
    if (!text && !file) {
      return res.status(400).json({
        message: "Please provide either text or a file",
      });
    }

    // Validation: both should not be present together
    if (text && file) {
      return res.status(400).json({
        message: "Only one of text or file is allowed",
      });
    }

    // Expiry handling
    let expiresAt;
    if (expiry) {
      expiresAt = new Date(expiry);
    } else {
      // Default expiry: 10 minutes
      expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    }

    // Store content in MongoDB
    const content = await Content.create({
      type: text ? "text" : "file",
      text: text || null,
      fileName: file ? file.filename : null,
      expiresAt,
    });

    // Return shareable URL
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
