import path from "path";
import { uploads } from "./upload.controller.js";

export const getContent = (req, res) => {
  const { id } = req.params;

  const record = uploads.get(id);

  // No such link
  if (!record) {
    return res.status(403).json({ message: "Invalid or expired link" });
  }

  // Expiry check
  if (new Date() > record.expiresAt) {
    uploads.delete(id);
    return res.status(403).json({ message: "Link expired" });
  }

  // Text content
  if (record.type === "text") {
    return res.json({
      type: "text",
      content: record.content,
    });
  }

  // File content
  const filePath = path.resolve("uploads", record.content);
  return res.download(filePath, record.originalName || record.content);
};
