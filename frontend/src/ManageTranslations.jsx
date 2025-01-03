/* eslint react/prop-types: */
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Box,
  Typography,
  Icon,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import ToggleOption from "./ToggleOption";
import TranslationCard from "./TranslationCard";
import QuickAdd from "./QuickAdd";
import AddToCollection from "./AddToCollection";
import MoveIcons from "./MoveIcons"; // used to navigate between existing word groups
import ToastMessage from "./ToastMessage";
import AddIcon from "@mui/icons-material/Add";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate, useParams } from "react-router-dom";
const ManageTranslations = ({ wordGroups, setWordGroups, languageNames }) => {
  const [hideSynonyms, setHideSynonyms] = useState(false);
  const [resetTagsOnSubmit, setResetTagsOnSubmit] = useState(false);
  const [editModeIndex, setEditModeIndex] = useState(null);
  const [hideLanguageSelections, setHideLanguageSelections] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastSeverity, setToastSeverity] = useState("success");
  const navigate = useNavigate();
  const tab = useParams().tab;
  const [activeTab, setActiveTab] = useState(tab || "add");

  useEffect(() => {
    console.log("tab changes in useEffect", tab);
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [tab, activeTab]);

  const allTags = wordGroups
    .map((wordGroup) => wordGroup.tags)
    .flat()
    .sort();

  const initialTranslations = [
    { languageName: "English", word: "", synonyms: [] },
    { languageName: "Finnish", word: "", synonyms: [] },
  ];
  const [translations, setTranslations] = useState(initialTranslations);

  const [tags, setTags] = useState([]);

  const isValidForm = () => {
    let valid = true;
    translations.forEach((translation) => {
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

  const handleTabChange = (tab) => {
    console.log("tab changes in handleTabChange", tab);
    if (tab === "add" || tab === "quick-add") {
      setTranslations(initialTranslations);
      setTags([]);
    }
    if (tab === "edit") {
      handleIndexChange(0);
    }
    navigate(`/manage-translations/${tab}`);
  };

  const handleIndexChange = (index) => {
    setEditModeIndex(index);
    const wordGroup = wordGroups[index];
    if (!wordGroup) {
      return;
    }
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
    if (activeTab === "add" || activeTab === "quick-add") {
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

    if (activeTab === "edit") {
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
      setToastMsg(
        "Translation group deleted successfully. No more groups left to edit."
      );
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

  const NothingToEdit = () => {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Card sx={{ width: "85%", maxWidth: 600, bgcolor: "#fafafa" }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Typography variant="h6" sx={{ textAlign: "center" }}>
                No translation groups to edit...
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Button
                  onClick={() => handleTabChange("add")}
                  variant="contained"
                  sx={{ bgcolor: "green" }}
                  startIcon={<AddIcon />}
                >
                  Add group
                </Button>
                <Button
                  onClick={() => handleTabChange("quick-add")}
                  variant="contained"
                  sx={{ bgcolor: "blue" }}
                  startIcon={<FlashOnIcon />}
                >
                  Quick add
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </div>
    );
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
          {activeTab === "add" && (
            <ToggleOption
              label="Reset tags on submit"
              value={resetTagsOnSubmit}
              setValue={setResetTagsOnSubmit}
            />
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
              !isValidForm() || (activeTab === "edit" && !dataChanged())
            }
          >
            {activeTab === "add" ? "Submit translation group" : "Save changes"}
          </Button>
          {activeTab === "edit" && (
            <Button
              onClick={onDeleteTranslationGroup}
              variant="contained"
              color="error"
              sx={{ mt: 2 }}
            >
              Delete group
            </Button>
          )}
          {activeTab === "edit" && (
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

  // Animation code was written by AI
  const tabStyle = (isActive) => ({
    display: "flex",
    alignItems: "center", // Vertically align icon and text
    px: 2,
    py: 1,
    gap: 1,
    color: isActive ? "blue" : "black", // Active tab color
    justifyContent: "center",
    position: "relative", // Required for absolute positioning of the pseudo-element
    overflow: "hidden", // Ensures the pseudo-element is clipped if outside bounds
    borderBottom: isActive ? "2px solid blue" : "none", // Permanent border for active tab
    "&:hover": {
      cursor: "pointer",
      color: "blue", // Change text color on hover
    },
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: "0%",
      width: "0%", // Initially set to 0% to hide the border
      height: "2px", // Set the thickness of the border
      backgroundColor: "blue", // Color of the sliding border
      transition: "width 0.3s ease-out", // Animate width expansion on hover
    },
    "&:hover::after": !isActive && {
      width: "100%", // Expand the width to 100% on hover
    },
  });

  // if the initial url is /manage-translations/edit, and there are word groups
  // then the handleIndexChange function has to be called with the first index
  // to correctly display the first word group in edit mode
  if (tab === "edit" && wordGroups.length > 0 && editModeIndex === null) {
    handleIndexChange(0);
  }

  return (
    <div>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          bgcolor: "#f0f0f0",
          mb: 2,
          gap: 1,
        }}
      >
        <Box
          sx={tabStyle(activeTab === "add")}
          onClick={() => handleTabChange("add")}
        >
          <Icon sx={{ display: "flex", alignItems: "center" }}>
            <AddIcon />
          </Icon>
          <Typography variant="body1">Add</Typography>
        </Box>
        <Box
          sx={tabStyle(activeTab === "quick-add")}
          onClick={() => handleTabChange("quick-add")}
        >
          <Icon sx={{ display: "flex", alignItems: "center" }}>
            <FlashOnIcon />
          </Icon>
          <Typography variant="body1">Quick Add</Typography>
        </Box>
        <Box
          sx={tabStyle(activeTab === "edit")}
          onClick={() => handleTabChange("edit")}
        >
          <Icon sx={{ display: "flex", alignItems: "center" }}>
            <EditIcon />
          </Icon>
          <Typography variant="body1">Edit</Typography>
        </Box>
      </Box>
      {activeTab === "edit" && wordGroups.length === 0 && <NothingToEdit />}
      {(activeTab === "add" ||
        (activeTab === "edit" && wordGroups.length > 0)) && (
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
      {activeTab === "quick-add" && (
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

export default ManageTranslations;
