import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const connString = process.env.DATABASE_URL;

if (!connString) {
	throw new Error("DATABASE_URL is required");
}

export default defineConfig({
	out: "./drizzle",
	schema: "./src/drizzle/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: connString,
	},
});
