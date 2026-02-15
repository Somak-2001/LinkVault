import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { startCleanupJob } from "./jobs/cleanupExpiredContent.js";

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    console.log("MongoDB connected");

    // 🔁 Start background cleanup job (Cloudinary auto-delete)
    startCleanupJob();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
