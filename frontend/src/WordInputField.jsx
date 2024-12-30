import { TextField } from "@mui/material";

const WordInputField = ({
  selectedWord,
  setSelectedWord,
  selectedLanguage,
}) => {

  return (
    <>
    <TextField
      autoComplete="off"
      label={`Word or phrase ${
        selectedLanguage ? `in ${selectedLanguage}` : ""
      }`}
      value={selectedWord}
      onChange={(e) => setSelectedWord(e.target.value)}
      fullWidth
      sx={{ my: 1 }}
    />
  </>
  );
};

export default WordInputField;
