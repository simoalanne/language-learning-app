import { TextField } from "@mui/material";

type WordInputFieldProps = {
	selectedWord: string;
	setSelectedWord: (word: string) => void;
	selectedLanguage?: string;
	invalidInputFunction?: (value: string) => boolean;
};

const WordInputField = ({
	selectedWord,
	setSelectedWord,
	selectedLanguage,
	invalidInputFunction,
}: WordInputFieldProps) => {
	const handleInputChange = (newValue: string) => {
		if (invalidInputFunction?.(newValue)) {
			return;
		}
		setSelectedWord(newValue || "");
	};

	return (
		<TextField
			sx={{ my: 1 }}
			autoComplete="off"
			label={`Word or short phrase ${
				selectedLanguage ? `in ${selectedLanguage}` : ""
			}`}
			value={selectedWord}
			onChange={(e) => handleInputChange(e.target.value)}
			fullWidth
		/>
	);
};

export default WordInputField;
