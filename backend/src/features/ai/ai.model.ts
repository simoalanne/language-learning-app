import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import { createOllama } from "ai-sdk-ollama";

// OpenAI when an API key is configured (production), local Ollama otherwise.
const openAiApiKey = process.env.OPENAI_API_KEY;

export const missingModelConfigMessage = openAiApiKey
	? "OpenAI is not configured. Set LLM_MODEL."
	: "No model configured. Set LLM_MODEL, plus OPENAI_API_KEY to use OpenAI instead of Ollama.";

const getLanguageModel = (): LanguageModel | null => {
	const modelId = process.env.LLM_MODEL;

	if (!modelId) {
		return null;
	}

	if (openAiApiKey) {
		return createOpenAI({
			apiKey: openAiApiKey,
			baseURL: process.env.OPENAI_BASE_URL,
		})(modelId);
	}

	// Thinking adds a long silent delay before the first streamed word on local models.
	return createOllama({ baseURL: process.env.OLLAMA_BASE_URL })(modelId, {
		think: false,
	});
};

export const languageModel = getLanguageModel();
