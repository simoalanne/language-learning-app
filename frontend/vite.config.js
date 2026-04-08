
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3000", // Adjust the port to your backend's port
    },
  },
  resolve: {
    preserveSymlinks: false,
  },
  cacheDir: path.resolve(__dirname, "../.vite-cache"), // Set cache directory outside frontend
});