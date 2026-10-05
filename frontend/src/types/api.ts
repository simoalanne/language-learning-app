import type { InferRouterInputs, InferRouterOutputs } from "@orpc/server";
import type { AppRouter } from "backend/router";

type Inputs = InferRouterInputs<AppRouter>;
type Outputs = InferRouterOutputs<AppRouter>;

export type WordGroup =
	Outputs["wordGroups"]["public"]["list"]["wordGroups"][number];
export type WordGroupTranslation = WordGroup["translations"][number];
export type LanguageName = WordGroupTranslation["languageName"];
export type WordGroupInput = Inputs["wordGroups"]["users"]["create"];
export type GenerateWordsInput = Inputs["ai"]["generateWords"];
export type AiUsageStatus = Outputs["ai"]["getUsage"];
export type AiGenerationHistoryResponse = Outputs["ai"]["listGenerations"];
export type AiGenerationHistoryItem =
	AiGenerationHistoryResponse["generations"][number];
export type GenerateWordsResponse = AiGenerationHistoryItem["response"];
export type GeneratedWord = GenerateWordsResponse[number];
export type GeneratedWordTranslation = GeneratedWord["translations"][number];
