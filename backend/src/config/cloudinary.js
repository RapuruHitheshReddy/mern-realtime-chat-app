import { v2 as cloudinary } from "cloudinary";
import loadEnv from "./env.js";
loadEnv();

if (process.env.NODE_ENV !== "production") {
  console.log("☁️ Cloudinary configured");
}


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
