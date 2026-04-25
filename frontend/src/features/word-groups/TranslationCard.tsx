import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Menu,
  Tooltip,
} from "@mui/material";
import { useRef, useState, type MouseEvent } from "react";
import AddToCollection from "./AddToCollection";
import LanguageFlag from "../../components/LanguageFlag";
import SelectLanguage from "../../components/SelectLanguage";
import WordInputField from "../ai-generation/WordInputField";
import type { LanguageName } from "@/types/api";

type TranslationCardProps = {
  languages: string[];
  selectedLanguage: LanguageName;
  setSelectedLanguage: (language: string) => void;
  selectedWord: string;
  setSelectedWord: (word: string) => void;
  synonyms: string[];
  setSynonyms: (synonyms: string[]) => void;
  onremoveTranslation: () => void;
  index: number;
  usedLanguages: string[];
  hideSynonyms: boolean;
  onClearCard: () => void;
  hideLanguageSelection?: boolean;
};

const TranslationCard = ({
  languages,
  selectedLanguage,
  setSelectedLanguage,
  selectedWord,
  setSelectedWord,
  synonyms,
  setSynonyms,
  onremoveTranslation,
  index,
  usedLanguages,
  hideSynonyms,
  onClearCard,
  hideLanguageSelection,
}: TranslationCardProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const addToCollectionRef = useRef<(() => void) | null>(null);

  return (
    <Card sx={{ width: 300, bgcolor: "#fafafa", position: "relative" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#87CEEB",
        }}
      >
        <CardHeader title={`${selectedLanguage} Translation`} />
        <LanguageFlag languageName={selectedLanguage} />
      </Box>
      <CardContent>
        {/* add a margin to the bottom so that the 3 dots menu never overlaps with the last item */}
        <Box sx={{ mb: 4 }}>
        <SelectLanguage
          languages={languages}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          usedLanguages={usedLanguages}
          hideLanguageSelection={hideLanguageSelection}
        />
        <WordInputField
          selectedWord={selectedWord}
          setSelectedWord={setSelectedWord}
          selectedLanguage={selectedLanguage}
          invalidInputFunction={(input: string) => input?.length > 60}
        />
        {!hideSynonyms && (
          <AddToCollection
            clearTextFieldRef={addToCollectionRef}
            collection={synonyms}
            onCollectionChange={setSynonyms}
            itemName={"synonym"}
            collectionLimit={3}
            invalidInputFunction={(input) => input?.length > 60}
          />
        )}
        </Box>
        <IconButton
          aria-label="more"
          aria-controls={`translation-menu-${index}`}
          aria-haspopup="true"
          onClick={(e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)}
          sx={{ position: "absolute", bottom: 8, right: 8 }}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id={`translation-menu-${index}`}
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          sx={{ 
            "& .MuiMenu-paper": {
              display: "flex",
              width: 75,
            },
          }}
          anchorOrigin={{
            vertical: "center",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "center",
            horizontal: "right",
          }}
        >
            <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Remove translation" placement="bottom">
            <IconButton size="small" disabled={usedLanguages.length <= 2} onClick={() => {
              onremoveTranslation();
              setAnchorEl(null);
            }}>
              <DeleteIcon />
            </IconButton >
            </Tooltip>
            <Tooltip title="Clear card" placement="bottom">
            <IconButton size="small" onClick={() => {
              onClearCard();
              if (addToCollectionRef.current) addToCollectionRef.current();
              setAnchorEl(null);
            }}>
              <RefreshIcon />
            </IconButton>
            </Tooltip>
              </Box>
        </Menu>
      </CardContent>
    </Card>
  );
};

export default TranslationCard;
