import AddIcon from "@mui/icons-material/Add";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import {
	Box,
	Button,
	CircularProgress,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	Tooltip,
	Typography,
} from "@mui/material";
import { useState } from "react";
import type { LanguageName } from "@/types/api";
import type {
	AiWordGenerationForm,
	SelectableGeneratedWord,
} from "./useAiWordGeneration";
import WordTranslationCard from "./WordTranslationCard";
import WordTranslationRow from "./WordTranslationRow";

type GeneratedWordsDisplayProps = {
	words: SelectableGeneratedWord[];
	form: AiWordGenerationForm;
	onChangeTranslation: (
		id: number,
		languageName: LanguageName,
		newWord: string,
	) => void;
	onSelect: (id: number, isSelected: boolean) => void;
	onFormChange: <K extends keyof AiWordGenerationForm>(
		key: K,
		value: AiWordGenerationForm[K],
	) => void;
	onSave: () => void;
	loading: boolean;
};

const WordListDisplay = ({
	words,
	form,
	onChangeTranslation,
	onSelect,
	onFormChange,
	onSave,
	loading,
}: GeneratedWordsDisplayProps) => {
	const [viewMode, setViewMode] = useState<"row" | "card">("row");
	const selectedWordsCount = words.filter((word) => word.isSelected).length;

	return (
		<Box
			sx={{
				mt: 4,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 2,
			}}
		>
			<ToggleButtonGroup
				value={viewMode}
				exclusive
				onChange={(e, next) => next && setViewMode(next)}
				size="small"
				sx={{ mb: 2 }}
			>
				<Tooltip title="List View" placement="top">
					<ToggleButton value="row">
						<ViewListIcon />
					</ToggleButton>
				</Tooltip>
				<Tooltip title="Card View" placement="top">
					<ToggleButton value="card">
						<ViewModuleIcon />
					</ToggleButton>
				</Tooltip>
			</ToggleButtonGroup>

			<Typography variant="h6">Generated Words:</Typography>
			<Box
				sx={
					viewMode === "card"
						? {
								display: "flex",
								flexWrap: "wrap",
								maxWidth: "1500px",
								gap: 2,
								justifyContent: "center",
							}
						: {}
				}
			>
				{words.map((wordItem, i) =>
					viewMode === "row" ? (
						<WordTranslationRow
							key={wordItem.id}
							wordItem={wordItem}
							isSelected={wordItem.isSelected}
							onSelect={onSelect}
							onChangeTranslation={onChangeTranslation}
						/>
					) : (
						<WordTranslationCard
							key={wordItem.id}
							wordItem={wordItem}
							isSelected={wordItem.isSelected}
							onSelect={onSelect}
							onChangeTranslation={onChangeTranslation}
							label={`${i + 1}/${words.length}`}
						/>
					),
				)}
			</Box>

			<Box
				sx={{
					display: "flex",
					flexWrap: "wrap",
					gap: 2,
					justifyContent: "center",
					alignItems: "center",
					my: 5,
				}}
			>
				<Typography variant="body1" sx={{ mr: 2 }}>
					{selectedWordsCount} out of {words.length} words selected
				</Typography>
				<TextField
					label="Tag1"
					placeholder="first describing tag"
					value={form.topic}
					onChange={(e) => onFormChange("topic", e.target.value)}
					size="small"
				/>
				<TextField
					label="Tag2"
					placeholder="second desribing tag"
					value={form.skillLevel}
					onChange={(e) => onFormChange("skillLevel", e.target.value)}
					size="small"
				/>
				<Button
					variant="contained"
					color="success"
					onClick={onSave}
					disabled={loading}
					endIcon={<AddIcon />}
				>
					Save Selected Words
				</Button>
				{loading && (
					<Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
						<Typography variant="body1">Saving words...</Typography>
						<CircularProgress size={24} />
					</Box>
				)}
			</Box>
		</Box>
	);
};

export default WordListDisplay;
