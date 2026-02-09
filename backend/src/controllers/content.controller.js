import path from "path";
import Content from "../models/Content.js";

export const getContent = async (req, res) => {
  try {
    const { id } = req.params;

    const content = await Content.findById(id);

    // Invalid or expired (TTL already deleted expired docs)
    if (!content) {
      return res.status(403).json({ message: "Invalid or expired link" });
    }

    // Text content
    if (content.type === "text") {
      return res.json({
        type: "text",
        content: content.text,
      });
    }

    // File content
    const filePath = path.resolve("uploads", content.fileName);
    return res.download(filePath);
  } catch (err) {
    console.error(err);
    return res.status(403).json({ message: "Invalid or expired link" });
  }
};
