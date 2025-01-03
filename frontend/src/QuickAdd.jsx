import SelectLanguage from "./SelectLanguage";
import WordInputField from "./WordInputField";
import LanguageFlag from "./LanguageFlag";
import ToggleOption from "./ToggleOption";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Box,
} from "@mui/material";
import { useState } from "react";

const QuickAdd = ({
  languages,
  selectedLanguage1,
  selectedLanguage2,
  setSelectedLanguage1,
  setSelectedLanguage2,
  selectedWord1,
  selectedWord2,
  setSelectedWord1,
  setSelectedWord2,
  allWords,
  usedLanguages,
  setDetailedMode,
  onSubmit,
}) => {
  const [hideLanguages, setHideLanguages] = useState(false);

  const invalidForm =
    selectedWord1?.trim() === "" || selectedWord2?.trim() === "";

  return (
    <Card sx={{ width: "85%", maxWidth: 600 }}>
      <Box sx={{ display: "flex", alignItems: "center", bgcolor: "#87CEEB" }}>
        <CardHeader title="Quick Add" />
        <LanguageFlag languageName={selectedLanguage1} />
        <LanguageFlag languageName={selectedLanguage2} />
      </Box>
      <CardContent>
        {!hideLanguages && (
          <SelectLanguage
            languages={languages}
            selectedLanguage={selectedLanguage1}
            setSelectedLanguage={setSelectedLanguage1}
            usedLanguages={usedLanguages}
          />
        )}
        <WordInputField
          selectedWord={selectedWord1}
          setSelectedWord={setSelectedWord1}
          selectedLanguage={selectedLanguage1}
          allWords={allWords}
        />
        {!hideLanguages && (
          <SelectLanguage
            languages={languages}
            selectedLanguage={selectedLanguage2}
            setSelectedLanguage={setSelectedLanguage2}
            usedLanguages={usedLanguages}
          />
        )}
        <WordInputField
          selectedWord={selectedWord2}
          setSelectedWord={setSelectedWord2}
          selectedLanguage={selectedLanguage2}
          allWords={allWords}
        />
        <Button
          variant="contained"
          sx={{ bgcolor: "green", mt: 1 }}
          disabled={invalidForm}
          fullWidth
          onClick={onSubmit}
        >
          Submit translation
        </Button>
        <Button
          variant="contained"
          color="secondary"
          sx={{ mt: 1 }}
          fullWidth
          onClick={() => setDetailedMode(true)}
        >
          Switch to detailed mode
        </Button>
        <ToggleOption
          label="Hide language selections?"
          value={hideLanguages}
          setValue={setHideLanguages}
        />
      </CardContent>
    </Card>
  );
};

export default QuickAdd;
