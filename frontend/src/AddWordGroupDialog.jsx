/* eslint react/prop-types: */
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { useState } from "react";
import axios from "axios";
import languageList from "./util/languageList";

const AddWordGroupDialog = ({ setWordGroups, words, setWords }) => {
  const [open, setOpen] = useState(false);
  const [warnings, setWarnings] = useState([false, false]);

  const languageNames = languageList.map((lang) => lang.name).sort();
  // isEdited is used to not show the error message for an empty language field
  // when the user has not had a chance to edit it yet
  const initialTranslations = [
    { languageName: "English", word: "", synonyms: [], isEdited: false },
    { languageName: "Finnish", word: "", synonyms: [], isEdited: false },
  ];
  // intially there will be two translations as that's obviously the minimum
  const [translations, setTranslations] = useState(initialTranslations);

  const resetDialog = () => {
    setTranslations(initialTranslations);
    setTags("");
    setDifficulty("");
    setWarnings([false, false]);
  };

  const [tags, setTags] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const isInvalidLanguage = (language) => {
    if (!language || language.trim() === "") {
      return { invalid: true, message: "Language cannot be empty!" };
    }
    if (!languageNames.includes(language)) {
      return {
        invalid: true,
        message: "Invalid language! Select a valid language from the dropdown list.",
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
    if (isNaN(difficulty)) {
      valid = false;
    }
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
      const newWarnings = [...warnings];
      newWarnings[index] = wordAlreadyUsed;
      setWarnings(newWarnings);
      if (wordAlreadyUsed) {
        console.log(`word ${word} already used in ${languageName}`);
      }
    }
  };

  const addTranslation = () => {
    setTranslations([
      ...translations,
      { languageName: "", word: "", synonyms: [], isEdited: false },
    ]);
    setWarnings([...warnings, false]);
  };

  const removeTranslation = (index) => {
    const newTranslations = translations.filter((_, i) => i !== index);
    setTranslations(newTranslations);
    const newWarnings = warnings.filter((_, i) => i !== index);
    setWarnings(newWarnings);
  };

  const onSubmit = async () => {
    console.log("tags are", tags);
    const wordGroupObj = {
      translations: translations.map((translation) => ({
        languageName: translation.languageName,
        word: translation.word,
        synonyms: translation.synonyms,
      })),
      tags: tags ? tags.split(",") : [],
      difficulty,
    };
    console.log("wordgroupObj to submit", wordGroupObj);

    await axios.post("/api/word-groups", wordGroupObj);
    setOpen(false);
    resetDialog();
    setWords((prevWords) => [
      ...prevWords,
      ...translations.map((t, index) => ({
        id: Math.max(...prevWords.map((w) => w.id), 0) + index + 1, // id is the highest id + index + 1
        word: t.word,
        languageName: t.languageName,
      })),
    ]);
    setWordGroups((prevWordGroups) => [...prevWordGroups, wordGroupObj]);
  };

  return (
    <div className="add-word-group-dialog">
      <Button variant="contained" onClick={() => setOpen(true)}>
        Add a new word group
      </Button>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          resetDialog();
        }}
      >
        <DialogTitle>Add Word Group</DialogTitle>
        <DialogContent>
          {translations.map((translation, index) => (
            <div key={index} style={{ marginTop: "10px" }}>
              <Autocomplete
                key={index}
                // dropdown options are all languages that have been used previously and
                // are not already in the translations array
                options={languageNames.filter(
                  (lang) =>
                    !translations.map((t) => t.languageName).includes(lang)
                )}
                value={translation.languageName || ""}
                onChange={(_, newValue) =>
                  handleTranslationChange(index, "languageName", newValue)
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Language"
                    variant="standard"
                    required
                    fullWidth
                    error={translations[index].isEdited && isInvalidLanguage(translation.languageName).invalid}
                    helperText={
                      translations[index].isEdited &&
                      isInvalidLanguage(translation.languageName).message
                    }
                    style={{ marginBottom: "10px" }}
                    onChange={(e) =>
                      handleTranslationChange(
                        index,
                        "languageName",
                        e.target.value
                      )
                    }
                  />
                )}
              />
              <TextField
                label={"word"}
                required
                error={warnings[index]}
                helperText={
                  warnings[index] &&
                  "Warning: You have already used this word on another word group!"
                }
                value={translation.word}
                onChange={(e) =>
                  handleTranslationChange(index, "word", e.target.value)
                }
                fullWidth
                // Disgusting code to change the error code from red to orange because the error is a warning
                // And the material ui does not have a warning prop separate from error.
                style={{ marginBottom: "10px" }}
                sx={{
                  "& .MuiFormLabel-root.Mui-error": {
                    color: "#D35400", // Error label color
                  },
                  "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline":
                    {
                      borderColor: "#D35400", // Error border color
                    },
                  "& .MuiFormHelperText-root.Mui-error": {
                    color: "#D35400", // Error helper text color
                  },
                  "& .MuiFormLabel-asterisk": {
                    color: warnings[index] && "#D35400", // Required asterisk color
                  },
                }}
              />
              <TextField
                label={"word synonyms (separated by commas)"}
                value={translation.synonyms.join(",")}
                fullWidth
                onChange={(e) =>
                  handleTranslationChange(
                    index,
                    "synonyms",
                    e.target.value.split(",")
                  )
                }
                style={{ marginBottom: "10px" }}
              />
              {translations.length > 2 && index > 1 && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => removeTranslation(index)}
                  fullWidth
                  style={{ marginRight: "10px" }}
                >
                  Remove Translation
                </Button>
              )}
            </div>
          ))}

          {/* Button to add new translation */}
          <Button
            variant="contained"
            fullWidth
            onClick={addTranslation}
            disabled={translations.length >= languageList.length} // disable button if all languages have been used
            style={{ marginTop: "10px" }}
          >
            Add Another Translation
          </Button>

          {/* Tags field */}
          <TextField
            label="Tags (separated by commas)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            fullWidth
            style={{ marginTop: "20px" }}
          />

          {/* Difficulty field */}
          <TextField
            label="Difficulty"
            value={difficulty}
            error={isNaN(difficulty)}
            helperText={
              isNaN(difficulty) && "Difficulty must be a number or blank!"
            }
            onChange={(e) => setDifficulty(e.target.value)}
            fullWidth
            style={{ marginTop: "20px" }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
              resetDialog();
            }}
          >
            Cancel
          </Button>
          <Button disabled={!isValidForm()} onClick={onSubmit}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddWordGroupDialog;
