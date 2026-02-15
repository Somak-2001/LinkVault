import cron from "node-cron";
import Content from "../models/Content.js";
import cloudinary from "../config/cloudinary.js";

export const startCleanupJob = () => {
  // Runs every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    console.log("🧹 Running cleanup job...");

    try {
      const now = new Date();

      const expiredContents = await Content.find({
        expiresAt: { $lt: now },
      });

      for (const content of expiredContents) {
        // Delete Cloudinary file if exists
        if (content.cloudinaryPublicId) {
          try {
            // Fallback to 'raw' if resourceType is missing or invalid (for old data)
            const resourceType = ['image', 'video', 'raw'].includes(content.cloudinaryResourceType)
              ? content.cloudinaryResourceType
              : 'raw'; // Default to 'raw' for documents/PDFs

            await cloudinary.uploader.destroy(
              content.cloudinaryPublicId,
              {
                resource_type: resourceType,
              }
            );
            console.log(
              `🗑️ Cloudinary deleted: ${content.cloudinaryPublicId}`
            );
          } catch (err) {
            console.error(
              "Cloudinary delete failed:",
              content.cloudinaryPublicId,
              err.message
            );
          }
        }

        // Delete MongoDB record
        await content.deleteOne();
        console.log(`🗑️ MongoDB record deleted: ${content._id}`);
      }
    } catch (error) {
      console.error("Cleanup job failed:", error);
    }
  });
};
