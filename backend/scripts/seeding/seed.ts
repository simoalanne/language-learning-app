import "dotenv/config";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	languageNameSchema,
	wordGroupInputSchema,
} from "@language-learning-app/contracts/wordGroups.schemas.ts";
import { isNull } from "drizzle-orm";
import z from "zod";
import db from "../../src/drizzle/db.ts";
import * as schema from "../../src/drizzle/schema.ts";

const csvRowSchema = z.object({
	language: languageNameSchema,
	word: z.string().trim().min(1),
	groupId: z.coerce.number().int().positive(),
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const parseCSV = (csvContent: string) => {
	const [headerLine, ...dataLines] = csvContent
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);

	if (!headerLine) {
		throw new Error("CSV file is empty.");
	}

	const headers = headerLine.split(",").map((header) => header.trim());
	const expectedHeaders = ["language", "word", "group_id"];

	if (
		headers.length !== expectedHeaders.length ||
		!expectedHeaders.every((header, index) => headers[index] === header)
	) {
		throw new Error(
			`Unexpected CSV headers. Expected: ${expectedHeaders.join(", ")}`,
		);
	}

	return dataLines.map((line, index) => {
		const [language, word, groupId] = line.split(",").map((cell) => cell.trim());

		return csvRowSchema.parse(
			{ language, word, groupId },
			{
				error: (issue) =>
					`Invalid CSV row ${index + 2}: ${issue.message}`,
			},
		);
	});
};

const buildWordGroups = (rows: Array<z.infer<typeof csvRowSchema>>) => {
	const groupsMap = new Map<number, Map<string, string>>();

	for (const row of rows) {
		const translations = groupsMap.get(row.groupId) ?? new Map<string, string>();

		if (translations.has(row.language)) {
			throw new Error(
				`Duplicate language "${row.language}" found for group ${row.groupId}.`,
			);
		}

		translations.set(row.language, row.word);
		groupsMap.set(row.groupId, translations);
	}

	return Array.from(groupsMap.entries())
		.sort(([leftId], [rightId]) => leftId - rightId)
		.map(([groupId, translations]) =>
			wordGroupInputSchema.parse({
				translations: Array.from(translations.entries()).map(
					([languageName, word]) => ({
						languageName,
						word,
						synonyms: [],
					}),
				),
				tags: [],
			},
			{
				error: (issue) =>
					`Invalid word group ${groupId}: ${issue.message}`,
			}),
		);
};

export const seedDatabase = async () => {
	try {
		console.log("Starting database seeding...");

		const csvPath = join(__dirname, "data.csv");
		const csvContent = await readFile(csvPath, "utf-8");
		const rows = parseCSV(csvContent);
		const wordGroups = buildWordGroups(rows);

		if (wordGroups.length === 0) {
			throw new Error("No word groups were parsed from the CSV file.");
		}

		console.log(`Loaded ${rows.length} translations across ${wordGroups.length} groups.`);

		await db.transaction(async (tx) => {
			const deletedPublicGroups = await tx
				.delete(schema.word_groups)
				.where(isNull(schema.word_groups.user_id))
				.returning({ id: schema.word_groups.id });

			console.log(`Removed ${deletedPublicGroups.length} existing public groups.`);

			const insertedGroups = await tx
				.insert(schema.word_groups)
				.values(
					wordGroups.map((group) => ({
						user_id: null,
						data: group,
					})),
				)
				.returning({ id: schema.word_groups.id });

			console.log(`Inserted ${insertedGroups.length} public word groups.`);
		});

		console.log("Database seeded successfully.");
	} catch (error) {
		console.error("Seeding failed:", error);
		process.exitCode = 1;
	}
};

await seedDatabase();
