import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.ts";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("DATABASE_URL is required");
}

const pool = new Pool({
	connectionString,
});

const db = drizzle(pool, { schema });
export default db;
