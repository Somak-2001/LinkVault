import express from "express";
import cors from "cors";
import uploadRoutes from "./routes/upload.routes.js";
import contentRoutes from "./routes/content.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api", uploadRoutes);
app.use("/api", contentRoutes);

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

export default app;
