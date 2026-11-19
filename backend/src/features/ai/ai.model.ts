import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import { createOllama } from "ai-sdk-ollama";

const isProduction = process.env.NODE_ENV === "production";

export const missingModelConfigMessage = isProduction
	? "OpenAI is not configured. Set OPENAI_API_KEY and LLM_MODEL in backend/.env."
	: "Ollama is not configured. Set LLM_MODEL in backend/.env.";

const getLanguageModel = (): LanguageModel | null => {
	const modelId = process.env.LLM_MODEL;

	if (!modelId) {
		return null;
	}

	if (isProduction) {
		const apiKey = process.env.OPENAI_API_KEY;
		return apiKey
			? createOpenAI({ apiKey, baseURL: process.env.OPENAI_BASE_URL })(modelId)
			: null;
	}

	// Thinking adds a long silent delay before the first streamed word on local models.
	return createOllama({ baseURL: process.env.OLLAMA_BASE_URL })(modelId, {
		think: false,
	});
};

export const languageModel = getLanguageModel();
