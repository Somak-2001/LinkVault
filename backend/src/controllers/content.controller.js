import path from "path";
import Content from "../models/Content.js";

export const getContent = async (req, res) => {
  try {
    const { id } = req.params;

    const content = await Content.findById(id);

    if (!content) {
      return res.status(403).json({
        message: "Invalid or expired link",
      });
    }

    // TEXT CONTENT
    if (content.type === "text") {
      return res.json({
        type: "text",
        content: content.text,
      });
    }

    // FILE CONTENT (NO AUTO DOWNLOAD)
    return res.json({
      type: "file",
      fileName: content.fileName,
      downloadUrl: `/api/content/${id}/download`,
    });

  } catch (err) {
    return res.status(403).json({
      message: "Invalid or expired link",
    });
  }
};
