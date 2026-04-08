import 'dotenv/config';
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { readFile } from "fs/promises";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as schema from "./schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

await client.connect();
const db = drizzle(client, { schema });

/**
 * Maps language_id to language name
 */
const languageMap = {
  1: 'english',
  2: 'finnish',
  6: 'swedish',
};

/**
 * Parses CSV data and returns an array of objects
 */
const parseCSV = (csvContent) => {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index];
    });
    return obj;
  });
};

/**
 * Seeds the database with initial word groups from CSV
 */
export const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Read and parse CSV file
    const csvPath = join(__dirname, 'data.csv');
    const csvContent = await readFile(csvPath, 'utf-8');
    const csvData = parseCSV(csvContent);

    console.log(`📄 CSV loaded: ${csvData.length} rows`);

    // Group words by group_id and organize by language
    // Structure: { groupId: { languageId: word } }
    const groupsMap = new Map();
    
    csvData.forEach(row => {
      const groupId = parseInt(row.group_id);
      const langId = parseInt(row.language_id);
      const word = row.word;

      if (!groupsMap.has(groupId)) {
        groupsMap.set(groupId, {});
      }
      groupsMap.get(groupId)[langId] = word;
    });

    console.log(`📍 Found ${groupsMap.size} unique groups from CSV`);

    // Convert grouped data into word_groups JSONB format
    const wordGroupsToInsert = Array.from(groupsMap.entries()).map(([groupId, langWords]) => ({
      user_id: null, // null for default/public groups
      data: {
        translations: Object.entries(langWords).map(([langId, word]) => ({
          languageName: languageMap[parseInt(langId)] || `language_${langId}`,
          word: word,
          synonyms: [], // No synonyms in CSV
        })),
        tags: [], // No tags in CSV
      },
      created_at: new Date(),
      updated_at: new Date(),
    }));

    if (wordGroupsToInsert.length === 0) {
      throw new Error('No word groups found in CSV. Ensure CSV has rows with valid group_id.');
    }

    await db.insert(schema.word_groups).values(wordGroupsToInsert);
    console.log(`✓ Word groups inserted (${wordGroupsToInsert.length} groups)`);

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
};

seedDatabase();
