import type { SelectChangeEvent } from "@mui/material";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

type SelectLanguagePairProps = {
	languageNames?: string[];
	selectedLanguages: [string, string];
	setSelectedLanguages: (languages: [string, string]) => void;
	labels?: [string, string];
	allowSameLanguages?: boolean;
};

type DropDownMenuProps = {
	index: 0 | 1;
};

const SelectLanguagePair = ({
	languageNames = [
		"English",
		"Finnish",
		"French",
		"German",
		"Spanish",
		"Swedish",
	],
	selectedLanguages,
	setSelectedLanguages,
	labels = ["Question language", "Answer language"],
	allowSameLanguages = false,
}: SelectLanguagePairProps) => {
	if (languageNames.length === 0) return null;
	const DropDownMenu = ({ index }: DropDownMenuProps) => {
		return (
			<FormControl fullWidth>
				<InputLabel id={`language-select-label-${index}`}>
					{index === 0 ? labels[0] : labels[1]}
				</InputLabel>
				<Select
					labelId={`language-select-label-${index}`}
					id="language-select"
					name="language-select"
					label={index === 0 ? labels[0] : labels[1]}
					value={selectedLanguages[index]}
					onChange={(e: SelectChangeEvent<string>) => {
						const newSelectedLanguages: [string, string] = [
							...selectedLanguages,
						];
						newSelectedLanguages[index] = e.target.value;
						setSelectedLanguages(newSelectedLanguages);
					}}
				>
					{languageNames
						.filter(
							(lang) =>
								allowSameLanguages ||
								!selectedLanguages[index === 0 ? 1 : 0].includes(lang),
						)
						.map((language) => (
							<MenuItem key={language} value={language}>
								{language}
							</MenuItem>
						))}
				</Select>
			</FormControl>
		);
	};
	return (
		<>
			<DropDownMenu index={0} />
			<DropDownMenu index={1} />
		</>
	);
};

export default SelectLanguagePair;
