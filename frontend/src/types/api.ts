import type { ApiRequest, ApiResponse } from "@language-learning-app/contracts";

export type WordGroup = ApiResponse<"wordGroups.public.list">["wordGroups"][number];
export type WordGroupTranslation = WordGroup["translations"][number];
export type LanguageName = WordGroupTranslation["languageName"];
export type WordGroupInput = ApiRequest<"wordGroups.users.create">;
export type GenerateWordsInput = ApiRequest<"ai.generateWords">;
export type GenerateWordsResponse = ApiResponse<"ai.generateWords">;
export type GeneratedWord = GenerateWordsResponse[number];
export type GeneratedWordTranslation = GeneratedWord["translations"][number];
