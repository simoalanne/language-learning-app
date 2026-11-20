import type { InferClientRequest, InferClientResponse } from "@rest-rpc/core";
import type { getBaseClient } from "../providers/api-client.tsx";

type Requests = InferClientRequest<ReturnType<typeof getBaseClient>>;
type Responses = InferClientResponse<ReturnType<typeof getBaseClient>>;

export type WordGroup =
	Responses["wordGroups"]["public"]["list"]["body"]["wordGroups"][number];
export type WordGroupTranslation = WordGroup["translations"][number];
export type LanguageName = WordGroupTranslation["languageName"];
export type WordGroupInput = Requests["wordGroups"]["users"]["create"]["body"];
export type GenerateWordsInput = Requests["ai"]["generateWords"]["body"];
export type AiUsageStatus = Responses["ai"]["getUsage"]["body"];
export type AiGenerationHistoryResponse =
	Responses["ai"]["listGenerations"]["body"];
export type AiGenerationHistoryItem =
	AiGenerationHistoryResponse["generations"][number];
export type GenerateWordsResponse = AiGenerationHistoryItem["response"];
export type GeneratedWord = GenerateWordsResponse[number];
export type GeneratedWordTranslation = GeneratedWord["translations"][number];
