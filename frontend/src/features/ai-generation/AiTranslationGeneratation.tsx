import { Box, Tab, Tabs, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import ContentAligner from "../../components/ContentAligner";
import ToastMessage from "../../components/ToastMessage";
import GeneratedWordsDisplay from "./GeneratedWordsDisplay";
import PreviousGenerationsTab from "./PreviousGenerationsTab";
import useAiWordGeneration from "./useAiWordGeneration";
import WordGenerationForm from "./WordGenerationForm";

const AiTranslationGeneratation = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
	const {
		form,
		formConfig,
		usageStatus,
		usageLoading,
		generationHistory,
		generationHistoryLoading,
		generateWordsErrorMessage,
		handleWordGenerationFormChange,
		handleGenerateWords,
		handleLoadHistoryGeneration,
		handleReturnToGenerationForm,
		generatedWords,
		handleSaveWordsToDatabase,
		handleWordItemSelectChange,
		handleWordItemTranslationChange,
		loading,
	} = useAiWordGeneration();

	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [activeTab, setActiveTab] = useState<"generate" | "history">(
		"generate",
	);

	useEffect(() => {
		if (generateWordsErrorMessage) {
			setSnackbarMessage(generateWordsErrorMessage);
		}
	}, [generateWordsErrorMessage]);

	const handleSave = async () => {
		try {
			await handleSaveWordsToDatabase();
			setSnackbarMessage("Words saved successfully!");
		} catch (error) {
			console.error("Saving words failed:", error);
			setSnackbarMessage("Failed to save words. Please try again!");
		}
	};

	const handleOpenHistoryGeneration = (
		generation: (typeof generationHistory)[number],
	) => {
		handleLoadHistoryGeneration(generation);
		setActiveTab("generate");
	};

	return (
		<ContentAligner
			background="url(/style1.png)"
			centerVertically={false}
			sx={{
				boxSizing: "border-box",
				width: "100%",
				px: { xs: 2, sm: 3 },
				pt: 4,
			}}
		>
			<Box sx={{ width: "100%", maxWidth: 1100 }}>
				<Tabs
					value={activeTab}
					onChange={(_event, value: "generate" | "history") =>
						setActiveTab(value)
					}
					variant={isMobile ? "fullWidth" : "standard"}
					centered={!isMobile}
					sx={{ mb: 2 }}
				>
					<Tab value="generate" label="Generate" />
					<Tab value="history" label="Previous Generations" />
				</Tabs>
			</Box>

			{activeTab === "generate" ? (
				generatedWords.length === 0 ? (
					<WordGenerationForm
						form={form}
						formConfig={formConfig}
						usageStatus={usageStatus}
						usageLoading={usageLoading}
						onChange={handleWordGenerationFormChange}
						onGenerate={handleGenerateWords}
						loading={loading}
					/>
				) : (
					<GeneratedWordsDisplay
						words={generatedWords}
						form={form}
						onFormChange={handleWordGenerationFormChange}
						onSelect={handleWordItemSelectChange}
						onChangeTranslation={handleWordItemTranslationChange}
						onBack={handleReturnToGenerationForm}
						onSave={handleSave}
						loading={loading}
					/>
				)
			) : (
				<PreviousGenerationsTab
					generations={generationHistory}
					loading={generationHistoryLoading}
					onOpenGeneration={handleOpenHistoryGeneration}
				/>
			)}
			<ToastMessage
				open={snackbarMessage !== ""}
				message={snackbarMessage}
				onClose={() => setSnackbarMessage("")}
				severity={snackbarMessage.startsWith("Failed") ? "error" : "success"}
			/>
		</ContentAligner>
	);
};

export default AiTranslationGeneratation;
