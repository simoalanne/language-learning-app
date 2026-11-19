import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import Macros from "unplugin-macros/vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [react(), Macros()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
		preserveSymlinks: false,
	},
	cacheDir: path.resolve(__dirname, "../.vite-cache"), // Set cache directory outside frontend
});
