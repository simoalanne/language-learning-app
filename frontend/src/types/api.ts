import type { contracts } from "@language-learning-app/contracts";
import type {
	RouteMutationVariables,
	RouteQueryData,
} from "@rest-rpc/tanstack-query";

export type WordGroup = RouteQueryData<
	typeof contracts.wordGroups.public.list
>["body"]["wordGroups"][number];
export type WordGroupTranslation = WordGroup["translations"][number];
export type LanguageName = WordGroupTranslation["languageName"];
export type WordGroupInput = RouteMutationVariables<
	typeof contracts.wordGroups.users.create
>;
export type GenerateWordsInput = RouteMutationVariables<
	typeof contracts.ai.generateWords
>;
export type GenerateWordsResponse = RouteQueryData<
	typeof contracts.ai.generateWords
>["body"];
export type AiUsageStatus = RouteQueryData<
	typeof contracts.ai.getUsage
>["body"];
export type AiGenerationHistoryResponse = RouteQueryData<
	typeof contracts.ai.listGenerations
>["body"];
export type AiGenerationHistoryItem =
	AiGenerationHistoryResponse["generations"][number];
export type GeneratedWord = GenerateWordsResponse[number];
export type GeneratedWordTranslation = GeneratedWord["translations"][number];
