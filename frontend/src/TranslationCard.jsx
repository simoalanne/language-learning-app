import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Tooltip,
  IconButton,
  Menu,
} from "@mui/material";
import LanguageFlag from "./LanguageFlag";
import SelectLanguage from "./SelectLanguage";
import WordInputField from "./WordInputField";
import AddToCollection from "./AddToCollection";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useState, useRef } from "react";

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
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const addToCollectionRef = useRef(null);

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
          index={index}
          hideLanguageSelection={hideLanguageSelection}
        />
        <WordInputField
          selectedWord={selectedWord}
          setSelectedWord={setSelectedWord}
          selectedLanguage={selectedLanguage}
        />
        {!hideSynonyms && (
          <AddToCollection
            clearTextFieldRef={addToCollectionRef}
            collection={synonyms}
            onCollectionChange={setSynonyms}
            itemName={"synonym"}
            collectionLimit={5}
          />
        )}
        </Box>
        <IconButton
          aria-label="more"
          aria-controls={`translation-menu-${index}`}
          aria-haspopup="true"
          onClick={(e) => setAnchorEl(e.currentTarget)}
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
              onremoveTranslation(index);
              setAnchorEl(null);
            }}>
              <DeleteIcon />
            </IconButton >
            </Tooltip>
            <Tooltip title="Clear card" placement="bottom">
            <IconButton size="small" onClick={() => {
              onClearCard(index);
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
