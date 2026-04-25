import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
} from "@mui/material";
import { useState } from "react";
import LanguageFlag from "../../components/LanguageFlag";
import SelectLanguage from "../../components/SelectLanguage";
import ToggleOption from "../../components/ToggleOption";
import WordInputField from "../ai-generation/WordInputField";
import type { LanguageName } from "@/types/api";

type QuickAddProps = {
  languages: string[];
  selectedLanguage1: LanguageName;
  selectedLanguage2: LanguageName;
  setSelectedLanguage1: (language: string) => void;
  setSelectedLanguage2: (language: string) => void;
  selectedWord1: string;
  selectedWord2: string;
  setSelectedWord1: (word: string) => void;
  setSelectedWord2: (word: string) => void;
  allWords?: string[];
  usedLanguages: string[];
  onSubmit: () => void;
};

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
  usedLanguages,
  onSubmit,
}: QuickAddProps) => {
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
          invalidInputFunction={() => false}
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
          invalidInputFunction={() => false}
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
