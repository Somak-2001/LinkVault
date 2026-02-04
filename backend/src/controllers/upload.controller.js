import path from "path";
import { generateId } from "../utils/generateId.js";

const uploads = new Map(); // temporary in-memory store

export const uploadHandler = (req, res) => {
  const { text, expiry } = req.body;
  const file = req.file;

  // Validation
  if (!text && !file) {
    return res.status(400).json({ message: "Text or file required" });
  }

  if (text && file) {
    return res.status(400).json({ message: "Only one of text or file allowed" });
  }

  const id = generateId();

  const expiresAt = expiry
    ? new Date(expiry)
    : new Date(Date.now() + 10 * 60 * 1000); // default 10 min

  uploads.set(id, {
    id,
    type: text ? "text" : "file",
    content: text || file.filename,
    expiresAt,
  });

  return res.json({
    url: `http://localhost:5173/view/${id}`,
  });
};

export { uploads };
