import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["text", "file"],
      required: true,
    },

    // Stores text content (if type === "text")
    text: {
      type: String,
      default: null,
    },

    // Stores uploaded file name (if type === "file")
    fileName: {
      type: String,
      default: null,
    },

    // Absolute expiry timestamp
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL index
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Content", contentSchema);
