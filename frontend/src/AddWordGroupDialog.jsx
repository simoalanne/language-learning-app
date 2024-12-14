import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { useState } from "react";
import axios from "axios";

const AddWordGroupDialog = ({ setWordGroups, languageNames }) => {
  const [open, setOpen] = useState(false);

  // intially there will be two translations as that's obviously the minimum
  const [translations, setTranslations] = useState([
    { languageName: "English", word: "", synonyms: [] },
    { languageName: "Finnish", word: "", synonyms: [] },
  ]);

  const resetDialog = () => {
    setTranslations([
      { languageName: "English", word: "", synonyms: [] },
      { languageName: "Finnish", word: "", synonyms: [] },
    ]);
    setTags("");
    setDifficulty("");
  };

  const [tags, setTags] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const handleTranslationChange = (index, field, value) => {
    console.log("changing", index, field, value);
    const newTranslations = [...translations];
    newTranslations[index][field] = value;
    setTranslations(newTranslations);
  };

  const addTranslation = () => {
    setTranslations([
      ...translations,
      { languageName: "", word: "", synonyms: [] },
    ]);
  };

  const removeTranslation = (index) => {
    const newTranslations = translations.filter((_, i) => i !== index);
    setTranslations(newTranslations);
  };

  const onSubmit = async () => {
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

    // Send the request to the backend
    await axios.post("http://localhost:3000/api/word-groups", wordGroupObj);
    setOpen(false);
    resetDialog();
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
                freeSolo
                // Dropdown options are all languages that have been used previously and are in the database.
                // Then languages that are already used in the current word group are not shown.
                options={languageNames.filter(
                  (lang) => !translations.map((t) => t.languageName).includes(lang)
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
                    style={{ marginBottom: "10px" }}
                    onChange={(e) => handleTranslationChange(index, "languageName", e.target.value)}
                  />
                )}
              />
              <TextField
                label={"word"}
                required
                value={translation.word}
                onChange={(e) =>
                  handleTranslationChange(index, "word", e.target.value)
                }
                fullWidth
                style={{ marginBottom: "10px" }}
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
          <Button onClick={onSubmit}>Submit</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddWordGroupDialog;
