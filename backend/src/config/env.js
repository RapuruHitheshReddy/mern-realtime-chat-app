import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

/* ES module dirname fix */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function loadEnv() {
  dotenv.config({
    path: path.resolve(__dirname, "../../.env"), // 🔥 IMPORTANT
  });
}
