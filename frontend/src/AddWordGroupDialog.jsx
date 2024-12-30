/* eslint react/prop-types: */
import { Card, CardContent, CardHeader, Button, Box } from "@mui/material";
import { useState } from "react";
import axios from "axios";
import ToggleOption from "./ToggleOption";
import TranslationCard from "./TranslationCard";
import QuickAdd from "./QuickAdd";
import AddToCollection from "./AddToCollection";

const AddWordGroupDialog = ({
  setWordGroups,
  words,
  setWords,
  languageNames,
}) => {
  const [detailedMode, setDetailedMode] = useState(true);
  const [displaySynonyms, setDisplaySynonyms] = useState(true);
  const [resetTagsOnSubmit, setResetTagsOnSubmit] = useState(false);

  // isEdited is used to not show the error message for an empty language field
  // when the user has not had a chance to edit it yet
  const initialTranslations = [
    { languageName: "English", word: "", synonyms: [], isEdited: false },
    { languageName: "Finnish", word: "", synonyms: [], isEdited: false },
  ];
  // intially there will be two translations as that's obviously the minimum
  const [translations, setTranslations] = useState(initialTranslations);

  const [tags, setTags] = useState([]);

  const isInvalidLanguage = (language) => {
    if (!language || language.trim() === "") {
      return { invalid: true, message: "Language cannot be empty!" };
    }
    if (!languageNames.includes(language)) {
      return {
        invalid: true,
        message:
          "Invalid language! Select a valid language from the dropdown list.",
      };
    }

    const occurrences = translations.filter(
      (t) => t.languageName === language
    ).length;
    return {
      invalid: occurrences > 1,
      message: occurrences > 1 ? "Language already used elsewhere!" : "",
    };
  };

  const isValidForm = () => {
    let valid = true;
    translations.forEach((translation) => {
      if (isInvalidLanguage(translation.languageName).invalid) {
        valid = false;
      }
      if (translation.word.trim() === "") {
        valid = false;
      }
    });
    return valid;
  };

  const handleTranslationChange = (index, field, value) => {
    console.log("changing", index, field, value);
    const newTranslations = [...translations];
    newTranslations[index].isEdited = true;
    newTranslations[index][field] = value;
    setTranslations(newTranslations);
    if (field === "word") {
      const word = value;
      const languageName = translations[index].languageName;
      const wordAlreadyUsed = words.some(
        (w) => w.word === word && w.languageName === languageName
      );
      if (wordAlreadyUsed) {
        console.log(`word ${word} already used in ${languageName}`);
      }
    }
  };

  const handleDetailedModeChange = (isOn) => {
    setDetailedMode(isOn);
    if (!isOn) {
      setTranslations(initialTranslations);
      setTags([]);
    }
  };

  const addTranslation = () => {
    // find the first language that is not yet used
    const languageName = languageNames.find(
      (name) => !translations.map((t) => t.languageName).includes(name)
    );
    setTranslations([
      ...translations,
      { languageName, word: "", synonyms: [] },
    ]);
  };

  const removeTranslation = (index) => {
    const newTranslations = translations.filter((_, i) => i !== index);
    setTranslations(newTranslations);
  };

  const missingTranslations = () => {
    const missing = translations.filter((t) => t.word.trim() === "").map((t) => t.languageName
    );
    return missing;
  }

  const onSubmit = async () => {
    console.log("tags are", tags);
    const wordGroupObj = {
      translations: translations.map((translation) => ({
        languageName: translation.languageName,
        word: translation.word,
        synonyms: translation.synonyms,
      })),
      tags,
    };
    console.log("wordgroupObj to submit", wordGroupObj);

    await axios.post("/api/word-groups", wordGroupObj);
    setWords((prevWords) => [
      ...prevWords,
      ...translations.map((t, index) => ({
        id: Math.max(...prevWords.map((w) => w.id), 0) + index + 1, // id is the highest id + index + 1
        word: t.word,
        languageName: t.languageName,
      })),
    ]);
    setWordGroups((prevWordGroups) => [...prevWordGroups, wordGroupObj]);
    // reset each translation language word and synonyms
    const newTranslations = translations.map((t) => ({
      languageName: t.languageName,
      word: "",
      synonyms: [],
    }));
    setTranslations(newTranslations);
    if (resetTagsOnSubmit) {
      setTags([]);
    }
  };

  const DetailsCard = () => {
    return (
      <Card sx={{ width: 300, bgcolor: "#fafafa" }}>
        <CardHeader
          sx={{ display: "flex", bgcolor: "#87CEEB" }}
          title="Group Details"
        />
        <CardContent>
          <p style={{fontWeight: "bold"}}>{`Translations: ${translations.length}/${languageNames.length}`}</p>
          {missingTranslations().length > 0 && (
            <p style={{fontWeight: "bold" }}>{`Missing translations for: ${missingTranslations().join(", ")}`}</p>
          )}
          <Button
            onClick={addTranslation}
            variant="contained"
            color="primary"
            size="small"
            disabled={translations.length === languageNames.length}
          >
            Add new translation
          </Button>
          <p style={{fontWeight: "bold"}}>Options:</p>
          <ToggleOption
            label="Display synonyms"
            value={displaySynonyms}
            setValue={setDisplaySynonyms}
          />
          <ToggleOption
            label="Reset tags on submit"
            value={resetTagsOnSubmit}
            setValue={setResetTagsOnSubmit}
          />
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={() => handleDetailedModeChange(false)}
          >
            Switch to quick add mode
          </Button>
          <AddToCollection
            collection={tags}
            onCollectionChange={setTags}
            itemName={"tag"}
            collectionLimit={5}
          />
          <Button
            onClick={onSubmit}
            variant="contained"
            color="primary"
            sx={{ mt: 2, bgcolor: "green" }}
            disabled={!isValidForm()}
          >
            Submit translation group
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      {detailedMode && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 4,
            maxWidth: 1400, // max 4 cards in a row (cards are 300px wide)
            margin: "auto",
          }}
        >
          {translations.map((translation, index) => (
            <TranslationCard
              key={index}
              languages={languageNames}
              selectedLanguage={translation.languageName}
              setSelectedLanguage={(language) =>
                handleTranslationChange(index, "languageName", language)
              }
              selectedWord={translation.word}
              setSelectedWord={(word) =>
                handleTranslationChange(index, "word", word)
              }
              synonyms={translation.synonyms}
              setSynonyms={(synonyms) =>
                handleTranslationChange(index, "synonyms", synonyms)
              }
              allWords={words}
              onremoveTranslation={() => removeTranslation(index)}
              index={index}
              usedLanguages={translations.map((t) => t.languageName)}
              displaySynonyms={displaySynonyms}
            />
          ))}
          <DetailsCard />
        </Box>
      )}
      {!detailedMode && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <QuickAdd
            languages={languageNames}
            selectedLanguage1={translations[0].languageName}
            selectedLanguage2={translations[1].languageName}
            setSelectedLanguage1={(language) =>
              handleTranslationChange(0, "languageName", language)
            }
            setSelectedLanguage2={(language) =>
              handleTranslationChange(1, "languageName", language)
            }
            selectedWord1={translations[0].word}
            setSelectedWord1={(word) =>
              handleTranslationChange(0, "word", word)
            }
            selectedWord2={translations[1].word}
            setSelectedWord2={(word) =>
              handleTranslationChange(1, "word", word)
            }
            allWords={words}
            usedLanguages={translations.map((t) => t.languageName)}
            setDetailedMode={(isOn) => handleDetailedModeChange(isOn)}
            onSubmit={onSubmit}
          />
        </Box>
      )}
    </div>
  );
};

export default AddWordGroupDialog;
