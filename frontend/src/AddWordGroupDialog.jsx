/* eslint react/prop-types: */
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  ButtonGroup,
  Box,
} from "@mui/material";
import { useState } from "react";
import axios from "axios";
import ToggleOption from "./ToggleOption";
import TranslationCard from "./TranslationCard";
import QuickAdd from "./QuickAdd";
import AddToCollection from "./AddToCollection";
import MoveIcons from "./MoveIcons"; // used to navigate between existing word groups
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ToastMessage from "./ToastMessage";

const AddWordGroupDialog = ({ wordGroups, setWordGroups, languageNames }) => {
  const [detailedMode, setDetailedMode] = useState(true);
  const [hideSynonyms, setHideSynonyms] = useState(false);
  const [resetTagsOnSubmit, setResetTagsOnSubmit] = useState(false);
  const [currentActivity, setCurrentActivity] = useState("add");
  const [editModeIndex, setEditModeIndex] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [hideLanguageSelections, setHideLanguageSelections] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastSeverity, setToastSeverity] = useState("success");

  const allTags = wordGroups.map((wordGroup) => wordGroup.tags).flat().sort();

  const initialTranslations = [
    { languageName: "English", word: "", synonyms: [] },
    { languageName: "Finnish", word: "", synonyms: [] },
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
    const newTranslations = [...translations];
    newTranslations[index][field] = value;
    setTranslations(newTranslations);
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
    const missing = translations
      .filter((t) => t.word.trim() === "")
      .map((t) => t.languageName);
    return missing;
  };

  const dataChanged = () => {
    const wordGroup = wordGroups[editModeIndex];
    if (!wordGroup) return false;
    console.log("dataChanged wordGroup", wordGroup);
    const translationsChanged = translations.some((t, i) => {
      const translation = wordGroup.translations[i];
      return (
        t.languageName !== translation.languageName ||
        t.word !== translation.word ||
        t.synonyms.join(",") !== translation.synonyms.join(",")
      );
    });
    const tagsChanged = tags.join(",") !== wordGroup.tags.join(",");
    return translationsChanged || tagsChanged;
  };

  const handleActivityChange = (activity) => {
    setCurrentActivity(activity);
    if (activity === "add") {
      setTranslations(initialTranslations);
      setTags([]);
      setEditModeIndex(0);
      setDetailedMode(true);
    }
    if (activity === "edit") {
      setDetailedMode(true);
      handleIndexChange(0);
    }
  };

  const handleIndexChange = (index) => {
    setEditModeIndex(index);
    const wordGroup = wordGroups[index];
    const translations = wordGroup.translations.map((translation) => ({
      languageName: translation.languageName,
      word: translation.word,
      synonyms: translation.synonyms,
    }));
    setTranslations(translations);
    const tags = wordGroup.tags;
    setTags(tags);
  };

  const onSubmit = async () => {
    const wordGroupObj = {
      translations: translations.map((translation) => ({
        languageName: translation.languageName,
        word: translation.word?.trim(),
        synonyms: translation.synonyms.map((s) => s?.trim()),
      })),
      tags: tags.map((tag) => tag?.trim()),
    };
    if (currentActivity === "add") {
      const id = (await axios.post("/api/word-groups", wordGroupObj)).data.id;
      setToastMsg("Translation group added successfully.");
      setToastOpen(true);
      setToastSeverity("success");
      console.log("id after post", id);
      const newWordGroups = [...wordGroups];
      newWordGroups.push({ id, ...wordGroupObj });
      setWordGroups(newWordGroups);
      console.log("newWordGroups after post", newWordGroups);
      const newTranslations = translations.map((t) => ({
        languageName: t.languageName,
        word: "",
        synonyms: [],
      }));
      setTranslations(newTranslations);
      if (resetTagsOnSubmit) {
        setTags([]);
      }
    }

    if (currentActivity === "edit") {
      const id = (
        await axios.put(
          `/api/word-groups/${wordGroups[editModeIndex].id}`,
          wordGroupObj
        )
      ).data.id;
      setToastMsg("Translation group updated successfully.");
      setToastOpen(true);
      setToastSeverity("success");
      console.log("id after put", id);
      const updatedWordGroups = [...wordGroups];
      updatedWordGroups[editModeIndex] = { id, ...wordGroupObj };
      setWordGroups(updatedWordGroups);
    }
  };

  const onDeleteTranslationGroup = async () => {
    console.log("deleting word group with id", wordGroups[editModeIndex].id);
    await axios.delete(`/api/word-groups/${wordGroups[editModeIndex].id}`);
    const updatedWordGroups = wordGroups.filter((_, i) => i !== editModeIndex);
    console.log("updatedWordGroups after delete", updatedWordGroups);
    setWordGroups(updatedWordGroups);

    // if there are no more word groups, switch to add mode
    if (updatedWordGroups.length === 0) {
      handleActivityChange("add");
      setToastMsg("Translation group deleted successfully. No more groups left to edit.");
      setToastOpen(true);
      setToastSeverity("error");
      return;
    }

    // if the last word group was deleted, switch to the previous one
    if (editModeIndex === updatedWordGroups.length) {
      handleIndexChange(editModeIndex - 1);
    }
    setToastMsg("Translation group deleted successfully.");
    setToastOpen(true);
    setToastSeverity("error");
  };

  const onClearCard = (index) => {
    const newTranslations = [...translations];
    newTranslations[index] = {
      languageName: translations[index].languageName,
      word: "",
      synonyms: [],
    };
    setTranslations(newTranslations);
  };

  const Header = () => {
    const title =
      currentActivity === "add"
        ? detailedMode
          ? "Add translations"
          : "Quick add"
        : "Edit translations";
    return <h2 style={{ textAlign: "center", marginBottom: "20px", borderBottom: "2px solid black" }}>{title}</h2>;
  };

  const DetailsCard = () => {
    return (
      <Card sx={{ width: 300, bgcolor: "#fafafa" }}>
        <CardHeader
          sx={{ display: "flex", bgcolor: "#87CEEB" }}
          title="Group Details"
        />
        <CardContent>
          <p
            style={{ fontWeight: "bold" }}
          >{`Translations: ${translations.length}/${languageNames.length}`}</p>
          {missingTranslations().length > 0 && (
            <p
              style={{ fontWeight: "bold" }}
            >{`Missing translations for: ${missingTranslations().join(
              ", "
            )}`}</p>
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
          <p style={{ fontWeight: "bold" }}>Options:</p>
          <ToggleOption
            label="Hide synonyms"
            value={hideSynonyms}
            setValue={setHideSynonyms}
          />
          <ToggleOption
            label="Hide language selections"
            value={hideLanguageSelections}
            setValue={setHideLanguageSelections}
          />
          {currentActivity === "add" && (
            <ToggleOption
              label="Reset tags on submit"
              value={resetTagsOnSubmit}
              setValue={setResetTagsOnSubmit}
            />
          )}
          {currentActivity === "add" && ( // when editing existing translations, this option is not available at least for now
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => handleDetailedModeChange(false)}
            >
              Switch to quick add mode
            </Button>
          )}
          <AddToCollection
            collection={tags}
            onCollectionChange={setTags}
            itemName={"tag"}
            collectionLimit={3}
            existingItems={allTags}
            invalidInputFunction={(tag) => tag?.length > 30}
          />
          <Button
            onClick={onSubmit}
            variant="contained"
            color="primary"
            sx={{ mt: 2, bgcolor: "green" }}
            disabled={
              !isValidForm() || (currentActivity === "edit" && !dataChanged())
            }
          >
            {currentActivity === "add"
              ? "Submit translation group"
              : "Save changes"}
          </Button>
          {currentActivity === "edit" && (
            <Button
              onClick={onDeleteTranslationGroup}
              variant="contained"
              color="error"
              sx={{ mt: 2 }}
            >
              Delete group
            </Button>
          )}
          {currentActivity === "edit" && (
            <MoveIcons
              currentIndex={editModeIndex}
              maxIndex={wordGroups.length - 1}
              onClick={(index) => handleIndexChange(index)}
            />
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      <Box
        sx={{ display: "flex", mb: 4, justifyContent: "center", maxWidth: 700 }}
      >
        <ButtonGroup variant="contained" color="success">
          <Button
            onClick={() => handleActivityChange("add")}
            variant="contained"
            sx={{ borderRadius: 0, bgcolor: "green" }}
            disableElevation
          >
            Add translations
          </Button>
          <Button
            size="small"
            disableElevation
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ borderRadius: 0, bgcolor: "green" }}
          >
            <ArrowDropDownIcon />
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                handleActivityChange("add");
                setDetailedMode(true);
              }}
            >
              Add translations
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                handleActivityChange("add");
                setDetailedMode(false);
              }}
            >
              Quick add
            </MenuItem>
          </Menu>
        </ButtonGroup>
        <Button
          onClick={() => handleActivityChange("edit")}
          variant="contained"
          color="secondary"
          sx={{ borderRadius: 0 }}
          disabled={wordGroups.length === 0}
          disableElevation
        >
          Edit translations
        </Button>
      </Box>
      <Header />
      {detailedMode && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: 4,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              maxWidth: 900 + 4 * 8,
              gap: 2,
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
                onremoveTranslation={() => removeTranslation(index)}
                index={index}
                usedLanguages={translations.map((t) => t.languageName)}
                hideSynonyms={hideSynonyms}
                onClearCard={() => onClearCard(index)}
                hideLanguageSelection={hideLanguageSelections}
              />
            ))}
          </Box>
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
            usedLanguages={translations.map((t) => t.languageName)}
            setDetailedMode={(isOn) => handleDetailedModeChange(isOn)}
            onSubmit={onSubmit}
          />
        </Box>
      )}
      {/* toast messages that will appear after, adding, editing or deleting a word group */}
      <ToastMessage
        open={toastOpen}
        setOpen={setToastOpen}
        message={toastMsg}
        severity={toastSeverity}
      />
    </div>
  );
};

export default AddWordGroupDialog;
