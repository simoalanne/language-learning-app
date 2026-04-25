import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import type { AlertColor, SxProps, Theme } from "@mui/material";
import {
	Box,
	Button,
	Card,
	CardContent,
	CardHeader,
	Icon,
	Typography,
} from "@mui/material";
import { type SyntheticEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type {
	LanguageName,
	WordGroup,
	WordGroupInput,
	WordGroupTranslation,
} from "@/types/api";
import ContentAligner from "../../components/ContentAligner";
import MoveIcons from "../../components/MoveIcons"; // used to navigate between existing word groups
import ToastMessage from "../../components/ToastMessage";
import ToggleOption from "../../components/ToggleOption";
import { useApiClient } from "../../providers/api-client";
import { useAppAuth } from "../../providers/use-app-auth";
import AddToCollection from "./AddToCollection";
import QuickAdd from "./QuickAdd";
import TranslationCard from "./TranslationCard";
import { normalizeWordGroup } from "./wordGroups";

type EditableTranslation = WordGroupTranslation;
type TabName = "add" | "quick-add" | "edit";

const LANGUAGE_NAMES: LanguageName[] = [
	"English",
	"Finnish",
	"French",
	"German",
	"Spanish",
	"Swedish",
];

const INITIAL_TRANSLATIONS: EditableTranslation[] = [
	{ languageName: "English", word: "", synonyms: [] },
	{ languageName: "Finnish", word: "", synonyms: [] },
];

const ManageTranslations = () => {
	const [hideSynonyms, setHideSynonyms] = useState(false);
	const [resetTagsOnSubmit, setResetTagsOnSubmit] = useState(false);
	const [editModeIndex, setEditModeIndex] = useState<number | null>(null);
	const [hideLanguageSelections, setHideLanguageSelections] = useState(false);
	const [toastOpen, setToastOpen] = useState(false);
	const [toastMsg, setToastMsg] = useState("");
	const [toastSeverity, setToastSeverity] = useState<AlertColor>("success");
	const navigate = useNavigate();
	const tab = useParams().tab;
	const [activeTab, setActiveTab] = useState<TabName>("add");
	const { api } = useApiClient();
	const { isAuthenticated, isLoaded } = useAppAuth();
	const wordGroupsQuery = api.wordGroups.users.list.useQuery(
		isLoaded && isAuthenticated ? {} : false,
		{
			select: (data) => data.wordGroups.map(normalizeWordGroup),
		},
	);
	const createWordGroup = api.wordGroups.users.create.useMutation();
	const updateWordGroup = api.wordGroups.users.update.useMutation();
	const removeWordGroup = api.wordGroups.users.remove.useMutation();
	const wordgroups: WordGroup[] = wordGroupsQuery.data ?? [];

	useEffect(() => {
		if (tab === "add" || tab === "quick-add" || tab === "edit") {
			setActiveTab(tab);
		}
	}, [tab]);

	useEffect(() => {
		if (tab === "edit" && wordgroups.length > 0 && editModeIndex === null) {
			handleIndexChange(0);
		}
	}, [tab, wordgroups, editModeIndex]);

	const allTags = [
		...new Set(wordgroups.flatMap((wordGroup) => wordGroup.tags).sort()),
	];
	const [translations, setTranslations] =
		useState<EditableTranslation[]>(INITIAL_TRANSLATIONS);
	const [tags, setTags] = useState<string[]>([]);

	const isValidForm = () => {
		return translations.every((translation) => translation.word.trim() !== "");
	};

	const handleTranslationChange = <K extends keyof EditableTranslation>(
		index: number,
		field: K,
		value: EditableTranslation[K],
	) => {
		const newTranslations = [...translations];
		newTranslations[index][field] = value;
		setTranslations(newTranslations);
	};

	const addTranslation = () => {
		// find the first language that is not yet used
		const languageName = LANGUAGE_NAMES.find(
			(name) => !translations.map((t) => t.languageName).includes(name),
		);
		if (!languageName) {
			return;
		}
		setTranslations([
			...translations,
			{ languageName, word: "", synonyms: [] },
		]);
	};

	const removeTranslation = (index: number) => {
		const newTranslations = translations.filter((_, i) => i !== index);
		setTranslations(newTranslations);
	};

	const missingTranslations = () => {
		const missing = translations
			.filter((t) => t.word.trim() === "")
			.map((t) => t.languageName);
		return missing;
	};

	const dataChanged = () => {
		if (editModeIndex === null) return false;
		const wordGroup = wordgroups[editModeIndex];
		if (!wordGroup) return false;
		const translationsChanged = translations.some((t, i) => {
			const translation = wordGroup.translations[i];
			if (!translation) return true; // if word group has less translations than the form then it has changed
			return (
				t.languageName !== translation.languageName ||
				t.word !== translation.word ||
				t.synonyms.join(",") !== translation.synonyms.join(",")
			);
		});
		const tagsChanged = tags.join(",") !== wordGroup.tags.join(",");
		return translationsChanged || tagsChanged;
	};

	const handleTabChange = (nextTab: TabName) => {
		if (tab === "add" || tab === "quick-add") {
			setTranslations(INITIAL_TRANSLATIONS);
			setTags([]);
		}
		if (nextTab === "edit") {
			handleIndexChange(0);
		}
		navigate(`/manage-translations/${nextTab}`);
	};

	const handleIndexChange = (index: number) => {
		setEditModeIndex(index);
		const wordGroup = wordgroups[index];
		if (!wordGroup) {
			return;
		}
		const translations = wordGroup.translations.map((translation) => ({
			languageName: translation.languageName,
			word: translation.word,
			synonyms: translation.synonyms,
		}));
		setTranslations(translations);
		const tags = wordGroup.tags;
		setTags(tags);
	};

	const onSubmit = async () => {
		const wordGroupObj: WordGroupInput = {
			translations: translations.map((translation) => ({
				languageName: translation.languageName,
				word: translation.word?.trim(),
				synonyms: translation.synonyms.map((s) => s?.trim()),
			})),
			tags: tags.map((tag) => tag?.trim()),
		};
		if (activeTab === "add" || activeTab === "quick-add") {
			await createWordGroup.mutateAsync(wordGroupObj);
			void api.wordGroups.users.list.invalidate({});
			setToastMsg("Translation group added successfully.");
			setToastOpen(true);
			setToastSeverity("success");
			const newTranslations = translations.map((t) => ({
				languageName: t.languageName,
				word: "",
				synonyms: [],
			}));
			setTranslations(newTranslations);
			if (resetTagsOnSubmit) {
				setTags([]);
			}
		}

		if (activeTab === "edit") {
			if (editModeIndex === null) {
				return;
			}
			const id = wordgroups[editModeIndex].id;
			await updateWordGroup.mutateAsync({ id, ...wordGroupObj });
			void api.wordGroups.users.list.invalidate({});
			setToastMsg("Translation group updated successfully.");
			setToastOpen(true);
			setToastSeverity("success");
		}
	};

	const onDeleteTranslationGroup = async () => {
		if (editModeIndex === null) {
			return;
		}
		await removeWordGroup.mutateAsync({ id: wordgroups[editModeIndex].id });
		void api.wordGroups.users.list.invalidate({});
		const updatedWordGroups = wordgroups.filter((_, i) => i !== editModeIndex);

		if (updatedWordGroups.length === 0) {
			setToastMsg(
				"Translation group deleted successfully. No more groups left to edit.",
			);
			setToastOpen(true);
			setToastSeverity("error");
			return;
		}

		// if the last word group was deleted, switch to the previous one
		if (editModeIndex === updatedWordGroups.length) {
			handleIndexChange(editModeIndex - 1);
		} else {
			handleIndexChange(editModeIndex);
		}
		setToastMsg("Translation group deleted successfully.");
		setToastOpen(true);
		setToastSeverity("error");
	};

	const onClearCard = (index: number) => {
		const newTranslations = [...translations];
		newTranslations[index] = {
			languageName: translations[index].languageName,
			word: "",
			synonyms: [],
		};
		setTranslations(newTranslations);
	};

	const NothingToEdit = () => {
		return (
			<div style={{ display: "flex", justifyContent: "center" }}>
				<Card sx={{ width: "85%", maxWidth: 600, bgcolor: "#fafafa" }}>
					<CardContent>
						<Box
							sx={{
								display: "flex",
								justifyContent: "center",
								flexDirection: "column",
								gap: 2,
							}}
						>
							<Typography variant="h6" sx={{ textAlign: "center" }}>
								No translation groups to edit...
							</Typography>
							<Box
								sx={{
									display: "flex",
									justifyContent: "center",
									gap: 2,
									flexWrap: "wrap",
								}}
							>
								<Button
									onClick={() => handleTabChange("add")}
									variant="contained"
									sx={{ bgcolor: "green" }}
									startIcon={<AddIcon />}
								>
									Add group
								</Button>
								<Button
									onClick={() => handleTabChange("quick-add")}
									variant="contained"
									sx={{ bgcolor: "blue" }}
									startIcon={<FlashOnIcon />}
								>
									Quick add
								</Button>
							</Box>
						</Box>
					</CardContent>
				</Card>
			</div>
		);
	};

	const DetailsCard = () => {
		return (
			<Card sx={{ width: 300, bgcolor: "#fafafa" }}>
				<CardHeader
					sx={{ display: "flex", bgcolor: "#87CEEB" }}
					title="Group Details"
				/>
				<CardContent>
					<p
						style={{ fontWeight: "bold" }}
					>{`Translations: ${translations.length}/${LANGUAGE_NAMES.length}`}</p>
					{missingTranslations().length > 0 && (
						<p
							style={{ fontWeight: "bold" }}
						>{`Missing translations for: ${missingTranslations().join(
							", ",
						)}`}</p>
					)}
					<Button
						onClick={addTranslation}
						variant="contained"
						color="primary"
						size="small"
						disabled={translations.length === LANGUAGE_NAMES.length}
					>
						Add new translation
					</Button>
					<p style={{ fontWeight: "bold" }}>Options:</p>
					<ToggleOption
						label="Hide synonyms"
						value={hideSynonyms}
						setValue={setHideSynonyms}
					/>
					<ToggleOption
						label="Hide language selections"
						value={hideLanguageSelections}
						setValue={setHideLanguageSelections}
					/>
					{activeTab === "add" && (
						<ToggleOption
							label="Reset tags on submit"
							value={resetTagsOnSubmit}
							setValue={setResetTagsOnSubmit}
						/>
					)}
					<AddToCollection
						collection={tags}
						onCollectionChange={setTags}
						itemName={"tag"}
						collectionLimit={3}
						existingItems={allTags}
						invalidInputFunction={(tag) => tag?.length > 30}
					/>
					<Button
						onClick={onSubmit}
						variant="contained"
						color="primary"
						fullWidth
						sx={{ mt: 2, bgcolor: "green" }}
						disabled={
							!isValidForm() || (activeTab === "edit" && !dataChanged())
						}
					>
						{activeTab === "add" ? "Submit translation group" : "Save changes"}
					</Button>
					{activeTab === "edit" && (
						<Button
							onClick={onDeleteTranslationGroup}
							variant="contained"
							color="error"
							fullWidth
							sx={{ mt: 2 }}
						>
							Delete group
						</Button>
					)}
					{activeTab === "edit" && editModeIndex !== null && (
						<MoveIcons
							currentIndex={editModeIndex}
							maxIndex={wordgroups.length - 1}
							onClick={(index: number) => handleIndexChange(index)}
						/>
					)}
				</CardContent>
			</Card>
		);
	};

	// Animation code was written by AI
	const tabStyle = (isActive: boolean): SxProps<Theme> => ({
		display: "flex",
		alignItems: "center",
		px: 2,
		py: 1,
		gap: 1,
		color: isActive ? "blue" : undefined,
		justifyContent: "center",
		position: "relative", // Required for absolute positioning of the pseudo-element
		overflow: "hidden", // Ensures the pseudo-element is clipped if outside bounds

		"&:hover": {
			cursor: "pointer",
			color: "blue",
		},

		// Pseudo-element for the animated border
		"&::after": {
			content: '""',
			position: "absolute",
			bottom: 0,
			left: "50%", // Start from the center of the tab
			transform: "translateX(-50%)", // Center the border
			width: "0%", // Initially set the width to 0% (invisible)
			height: "2px", // Set the thickness of the border
			backgroundColor: "blue", // Active color for the border
			transition: "width 0.3s ease-out", // Animate width expansion
		},

		// When active, the border expands outwards from the center
		"&.active::after": {
			width: "100%", // Expand to full width from the center
		},

		// When inactive, the border shrinks back to 0
		"&:not(.active)::after": {
			width: "0%", // Shrink to 0%
		},
	});

	if (!isLoaded || wordGroupsQuery.isLoading) {
		return null;
	}

	return (
		<ContentAligner centerVertically={false}>
			<Box
				sx={{
					width: "100%",
					display: "flex",
					justifyContent: "center",
					bgcolor: "#f0f0f0",
					mb: 2,
					gap: 1,
				}}
			>
				<Box
					sx={tabStyle(activeTab === "add")}
					className={activeTab === "add" ? "active" : ""}
					onClick={() => handleTabChange("add")}
				>
					<Icon sx={{ display: "flex", alignItems: "center" }}>
						<AddIcon />
					</Icon>
					<Typography variant="body1">Add</Typography>
				</Box>
				<Box
					sx={tabStyle(activeTab === "quick-add")}
					className={activeTab === "quick-add" ? "active" : ""}
					onClick={() => handleTabChange("quick-add")}
				>
					<Icon sx={{ display: "flex", alignItems: "center" }}>
						<FlashOnIcon />
					</Icon>
					<Typography variant="body1">Quick Add</Typography>
				</Box>
				<Box
					sx={tabStyle(activeTab === "edit")}
					className={activeTab === "edit" ? "active" : ""}
					onClick={() => handleTabChange("edit")}
				>
					<Icon sx={{ display: "flex", alignItems: "center" }}>
						<EditIcon />
					</Icon>
					<Typography variant="body1">Edit</Typography>
				</Box>
			</Box>
			{activeTab === "edit" && wordgroups.length === 0 && <NothingToEdit />}
			{(activeTab === "add" ||
				(activeTab === "edit" && wordgroups.length > 0)) && (
				<Box
					sx={{
						display: "flex",
						flexWrap: "wrap",
						justifyContent: "center",
						alignItems: "flex-start",
						gap: 4,
					}}
				>
					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							flexWrap: "wrap",
							maxWidth: 900 + 4 * 8,
							gap: 2,
						}}
					>
						{translations.map((translation, index) => (
							<TranslationCard
								key={index}
								languages={LANGUAGE_NAMES}
								selectedLanguage={translation.languageName}
								setSelectedLanguage={(language) =>
									handleTranslationChange(
										index,
										"languageName",
										language as LanguageName,
									)
								}
								selectedWord={translation.word}
								setSelectedWord={(word) =>
									handleTranslationChange(index, "word", word)
								}
								synonyms={translation.synonyms}
								setSynonyms={(synonyms) =>
									handleTranslationChange(index, "synonyms", synonyms)
								}
								onremoveTranslation={() => removeTranslation(index)}
								index={index}
								usedLanguages={translations.map((t) => t.languageName)}
								hideSynonyms={hideSynonyms}
								onClearCard={() => onClearCard(index)}
								hideLanguageSelection={hideLanguageSelections}
							/>
						))}
					</Box>
					<DetailsCard />
				</Box>
			)}
			{activeTab === "quick-add" && (
				<Box sx={{ display: "flex", justifyContent: "center" }}>
					<QuickAdd
						languages={LANGUAGE_NAMES}
						selectedLanguage1={translations[0].languageName}
						selectedLanguage2={translations[1].languageName}
						setSelectedLanguage1={(language) =>
							handleTranslationChange(
								0,
								"languageName",
								language as LanguageName,
							)
						}
						setSelectedLanguage2={(language) =>
							handleTranslationChange(
								1,
								"languageName",
								language as LanguageName,
							)
						}
						selectedWord1={translations[0].word}
						setSelectedWord1={(word) =>
							handleTranslationChange(0, "word", word)
						}
						selectedWord2={translations[1].word}
						setSelectedWord2={(word) =>
							handleTranslationChange(1, "word", word)
						}
						usedLanguages={translations.map((t) => t.languageName)}
						onSubmit={onSubmit}
					/>
				</Box>
			)}
			{/* toast messages that will appear after, adding, editing or deleting a word group */}
			<ToastMessage
				open={toastOpen}
				onClose={(
					_event?: Event | SyntheticEvent<unknown>,
					reason?: string,
				) => {
					if (reason === "clickaway") {
						return;
					}
					setToastOpen(false);
				}}
				message={toastMsg}
				severity={toastSeverity}
			/>
		</ContentAligner>
	);
};

export default ManageTranslations;
