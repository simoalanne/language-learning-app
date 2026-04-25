import { TextField } from "@mui/material";

const WordInputField = ({
  selectedWord,
  setSelectedWord,
  selectedLanguage,
  invalidInputFunction,
}) => {
  const handleInputChange = (newValue) => {
    if (invalidInputFunction && invalidInputFunction(newValue)) {
      return;
    }
    setSelectedWord(newValue || "");
  };

  return (
    <>
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
    </>
  );
};

export default WordInputField;
