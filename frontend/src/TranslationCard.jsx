import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Tooltip,
  IconButton,
} from "@mui/material";
import LanguageFlag from "./LanguageFlag";
import SelectLanguage from "./SelectLanguage";
import WordInputField from "./WordInputField";
import AddToCollection from "./AddToCollection";
import DeleteIcon from "@mui/icons-material/Delete";

const TranslationCard = ({
  languages,
  selectedLanguage,
  setSelectedLanguage,
  selectedWord,
  setSelectedWord,
  synonyms,
  setSynonyms,
  allWords,
  onremoveTranslation,
  index,
  usedLanguages,
  displaySynonyms,
}) => {
  return (
    <Card sx={{ width: 300, bgcolor: "#fafafa" }}>
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
        <SelectLanguage
          languages={languages}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          usedLanguages={usedLanguages}
          index={index}
        />
        <WordInputField
          selectedWord={selectedWord}
          setSelectedWord={setSelectedWord}
          selectedLanguage={selectedLanguage}
          allWords={allWords}
        />
        {displaySynonyms && (
          <AddToCollection
            collection={synonyms}
            onCollectionChange={setSynonyms}
            itemName={"synonym"}
            collectionLimit={5}
          />
        )}
        {index > 1 && (
          <Tooltip placement="right" title="Remove translation">
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <IconButton onClick={onremoveTranslation}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Tooltip>
        )}
      </CardContent>
    </Card>
  );
};

export default TranslationCard;
