import {
	Box,
	Button,
	Dialog,
	DialogContent,
	Slider,
	Typography,
} from "@mui/material";
import type { Dispatch, SetStateAction } from "react";
import type { LanguageName } from "@/types/api";
import ChipSelect from "../../components/ChipSelect";
import SelectLanguagePair from "../../components/SelectLanguagePair";
import SwapLanguagePair from "../../components/SwapLanguagePair";
import { useAppAuth } from "../../providers/use-app-auth";

export type TestModeState = {
	test: {
		questions: string[];
		correctAnswers: string[][];
	};
	settingsOpen: boolean;
	testStarted: boolean;
	totalHearts: number;
	heartsLeft: number;
	score: number;
	selectedLanguages: [LanguageName, LanguageName];
	selectedTags: string[];
	totalQuestions: number;
};

type TestSettingsProps = {
	testObject: TestModeState;
	setTestObject: Dispatch<SetStateAction<TestModeState>>;
	onTestStart: () => void;
	availableQuestions: number;
	onAppExit: () => void;
	availableTags: string[];
	pairsPerTag: number[];
};

const TestSettings = ({
	testObject,
	setTestObject,
	onTestStart,
	availableQuestions,
	onAppExit,
	availableTags,
	pairsPerTag,
}: TestSettingsProps) => {
	const { isAuthenticated } = useAppAuth();
	return (
		<Dialog open={testObject.settingsOpen} fullWidth>
			<DialogContent>
				<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
					<Typography variant="h4">Test Settings</Typography>
					<Typography variant="body1" sx={{ fontWeight: "bold" }}>
						Select the question and answer languages:
					</Typography>
					<SelectLanguagePair
						languageNames={
							isAuthenticated
								? [
										"English",
										"Finnish",
										"French",
										"German",
										"Spanish",
										"Swedish",
									]
								: ["English", "Finnish", "Swedish"]
						}
						selectedLanguages={testObject.selectedLanguages}
						setSelectedLanguages={(languages) =>
							setTestObject((prev) => ({
								...prev,
								selectedLanguages:
									languages as TestModeState["selectedLanguages"],
							}))
						}
						labels={["", ""]}
					/>
					<SwapLanguagePair
						selectedLanguages={testObject.selectedLanguages}
						setSelectedLanguages={(languages) =>
							setTestObject((prev) => ({
								...prev,
								selectedLanguages:
									languages as TestModeState["selectedLanguages"],
							}))
						}
					/>
					{availableTags.length > 0 && (
						<>
							<Typography variant="body1" sx={{ fontWeight: "bold" }}>
								Filtering options
							</Typography>
							<Typography variant="body2">
								pair must have at least one of the selected tags to be included
								in the game. The number in parentheses indicates how many pairs
								are available with the tag.
							</Typography>
							<ChipSelect
								options={availableTags}
								labels={availableTags.map(
									(tag, i) => `${tag} (${pairsPerTag[i]})`,
								)}
								selectedOptions={testObject.selectedTags}
								setSelectedOptions={(newSelectedTags) =>
									setTestObject((prev) => ({
										...prev,
										selectedTags: newSelectedTags as string[],
									}))
								}
							/>
						</>
					)}
					<Typography variant="body1" sx={{ fontWeight: "bold" }}>
						{`Select the number of questions. Max ${Math.min(
							availableQuestions,
							50,
						)} questions available.`}
					</Typography>
					<Slider
						value={testObject.totalQuestions}
						valueLabelDisplay="auto"
						step={1}
						min={1}
						max={Math.min(availableQuestions, 50)}
						onChange={(_, value) =>
							setTestObject((prev) => ({
								...prev,
								totalQuestions: value as number,
							}))
						}
					/>
					{availableQuestions === 0 && (
						<Typography
							variant="body1"
							sx={{
								color: "red",
								bgcolor: "rgba(255, 0, 0, 0.2)",
								p: 1,
								borderRadius: 1,
							}}
						>
							No questions available with current settings.
						</Typography>
					)}
					<Button
						variant="contained"
						onClick={onTestStart}
						sx={{ bgcolor: "green" }}
						disabled={availableQuestions === 0}
					>
						Start Test
					</Button>
					<Button
						variant="contained"
						onClick={onAppExit}
						sx={{ bgcolor: "#36454F" }}
					>
						Back to Mode Selection
					</Button>
				</Box>
			</DialogContent>
		</Dialog>
	);
};

export default TestSettings;
