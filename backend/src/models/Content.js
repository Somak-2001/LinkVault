import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    // Determines whether content is text or file
    type: {
      type: String,
      enum: ["text", "file"],
      required: true,
    },

    // Text content (used when type === "text")
    text: {
      type: String,
      default: null,
    },

    // Cloudinary secure URL (used when type === "file")
    fileUrl: {
      type: String,
      default: null,
    },

    // Cloudinary public ID (used for deletion)
    cloudinaryPublicId: {
      type: String,
      default: null,
    },

    // Cloudinary resource type: image | video | raw
    // IMPORTANT: used during download to avoid corruption / 404
    cloudinaryResourceType: {
      type: String,
      enum: ["image", "video", "raw"],
      required: function () {
        return this.type === "file";
      },
    },

    // Original filename (for UI display)
    originalFileName: {
      type: String,
      default: null,
    },

    // Optional password protection (bcrypt hash)
    passwordHash: {
      type: String,
      default: null,
    },

    // View limit (null = unlimited)
    viewsRemaining: {
      type: Number,
      default: null,
    },

    // User association (null for guest uploads)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Absolute expiry timestamp (handled by cron job)
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Content", contentSchema);
