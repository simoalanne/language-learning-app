import * as startingTranslations from "./addStartingTranslations.js";
import { writeFileSync } from "fs";

const commonWords = [...startingTranslations.adjectives, ...startingTranslations.commonWords, ...startingTranslations.sports, ...startingTranslations.animals, ...startingTranslations.verbs]

const regex = /^\((\d+),\s*"([^"]+)",\s*(\d+)\)$/

const rows = commonWords
  .map(s => s.match(regex))
  .filter(Boolean)
  .map(([, langId, word, groupId]) => [langId, word, groupId])

const csv = [
  ["language_id", "word", "group_id"],
  ...rows
].map(r => r.join(",")).join("\n")

writeFileSync("data.csv", csv)