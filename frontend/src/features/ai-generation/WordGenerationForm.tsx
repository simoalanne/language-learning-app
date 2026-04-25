import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Slider,
	TextField,
	Typography,
} from "@mui/material";
import ChipSelect from "../../components/ChipSelect";
import LanguageFlag from "../../components/LanguageFlag";
import type {
	AiWordGenerationForm,
	AiWordGenerationFormConfig,
} from "./useAiWordGeneration";
import type { AiUsageStatus } from "@/types/api";

type WordGenerationFormProps = {
	form: AiWordGenerationForm;
	formConfig: AiWordGenerationFormConfig;
	usageStatus?: AiUsageStatus;
	usageLoading: boolean;
	onChange: <K extends keyof AiWordGenerationForm>(
		key: K,
		value: AiWordGenerationForm[K],
	) => void;
	onSubmit: () => void;
	loading: boolean;
};

const formatResetAt = (value: string | null) => {
	if (!value) {
		return null;
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return null;
	}

	return new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
};

const WordGenerationForm = ({
	form,
	formConfig,
	usageStatus,
	usageLoading,
	onChange,
	onSubmit,
	loading,
}: WordGenerationFormProps) => {
	const hasLimit = typeof usageStatus?.limit === "number";
	const resetAtLabel = formatResetAt(usageStatus?.resetsAt ?? null);
	const generateDisabled =
		loading || usageLoading || usageStatus?.canGenerate === false;

	return (
		<Box sx={{ mb: 2 }}>
			<Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
				Generate Vocabulary
			</Typography>

			{usageLoading ? (
				<Alert severity="info" sx={{ mb: 2 }}>
					Checking AI generation availability...
				</Alert>
			) : hasLimit ? (
				<Alert
					severity={usageStatus?.canGenerate ? "info" : "warning"}
					sx={{ mb: 2 }}
				>
					{usageStatus?.remaining} of {usageStatus?.limit} AI generations
					remaining.
					{resetAtLabel ? ` Resets at ${resetAtLabel}.` : ""}
				</Alert>
			) : (
				<Alert severity="info" sx={{ mb: 2 }}>
					AI generation is currently not quota-limited for this demo.
				</Alert>
			)}

			<TextField
				label="Topic"
				placeholder="Describe any topic you can think of (e.g., travel, food)"
				value={form.topic}
				onChange={(e) => onChange("topic", e.target.value)}
				fullWidth
				sx={{ mb: 2 }}
			/>
			<TextField
				label="Skill Level"
				value={form.skillLevel}
				placeholder="Describe your skill level"
				onChange={(e) => onChange("skillLevel", e.target.value)}
				fullWidth
				sx={{ mb: 2 }}
			/>
			<Typography gutterBottom>
				Amount of words to generate: {form.wordCount}
			</Typography>
			<Slider
				value={form.wordCount}
				onChange={(_, newValue) => onChange("wordCount", newValue as number)}
				min={1}
				max={formConfig.maxGeneratedWordsPerRequest}
				step={1}
				valueLabelDisplay="auto"
				sx={{ mb: 2 }}
			/>
			<Typography gutterBottom>Specify word type(s) (optional):</Typography>
			<ChipSelect
				options={formConfig.wordTypes}
				selectedOptions={form.selectedWordTypes}
				setSelectedOptions={(val) =>
					onChange("selectedWordTypes", val as string[])
				}
				selectedColor="primary"
			/>
			<Typography gutterBottom>
				Select languages to include (at least 2):
			</Typography>
			<ChipSelect
				minimumSelectedCount={2}
				options={formConfig.languageNames}
				icons={formConfig.languageNames.map((lang) => (
					<LanguageFlag key={lang} languageName={lang} />
				))}
				selectedOptions={form.languages}
				setSelectedOptions={(langs) =>
					onChange("languages", langs as AiWordGenerationForm["languages"])
				}
				selectedColor="secondary"
				boxSx={{ mb: 2 }}
			/>
			<Button
				variant="contained"
				fullWidth
				sx={{ mt: 2 }}
				onClick={onSubmit}
				disabled={generateDisabled}
				endIcon={<AutoAwesomeIcon />}
			>
				Generate Words
			</Button>

			{loading && (
				<Box sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 1 }}>
					<Typography variant="body1">
						Letting the AI do its magic. This may take a while. Please wait...
					</Typography>
					<CircularProgress size={24} />
				</Box>
			)}
		</Box>
	);
};

export default WordGenerationForm;
