import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🔍 HARD PROOF LOG (TEMPORARY)
console.log("Cloudinary config check:", {
  cloud: process.env.CLOUDINARY_CLOUD_NAME,
  keyLoaded: !!process.env.CLOUDINARY_API_KEY,
  secretLoaded: !!process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
