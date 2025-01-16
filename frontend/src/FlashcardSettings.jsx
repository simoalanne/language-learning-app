import { Dialog, DialogContent, Box, Button, Typography } from "@mui/material";
import SelectLanguagePair from "./SelectLanguagePair";
import { useContext } from "react";
import { AuthContext } from "./Authorisation/AuthContext";
import ToggleOption from "./ToggleOption";
import SwapLanguagePair from "./SwapLanguagePair";

const FlashcardSettings = ({
  flashcardObject,
  setFlashcardObject,
  onAppExit,
  availableCards,
}) => {
  const { isAuthenticated } = useContext(AuthContext);
  return (
    <Dialog open={flashcardObject.settingsOpen} fullWidth>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h4">Flashcard Settings</Typography>
          {!flashcardObject.useAdvancedMode && (
            <Box sx={{ display: "flex", gap: 2, flexDirection: "column" }}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Select the front and back languages:
              </Typography>
              <SelectLanguagePair
                languageNames={
                  isAuthenticated
                    ? [
                        "English",
                        "Finnish",
                        "French",
                        "German",
                        "Spanish",
                        "Swedish",
                      ]
                    : ["English", "Finnish", "Swedish"]
                }
                selectedLanguages={flashcardObject.selectedLanguages}
                setSelectedLanguages={(languages) =>
                  setFlashcardObject((prev) => ({
                    ...prev,
                    selectedLanguages: languages,
                  }))
                }
                labels={["", ""]}
              />
              <SwapLanguagePair
                selectedLanguages={flashcardObject.selectedLanguages}
                setSelectedLanguages={(languages) =>
                  setFlashcardObject((prev) => ({
                    ...prev,
                    selectedLanguages: languages,
                  }))
                }
              />
            </Box>
          )}
          <Box
            sx={{
              bgcolor: "rgba(0, 200, 0, 0.2)",
              p: 1,
              borderRadius: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ width: "75%" }}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Advanced Mode
              </Typography>
              <Typography variant="body2">
                {`When enabled, the flashcards will contain all the available translations for the word.
                  Otherwise, the selected two languages will be used.`}
              </Typography>
            </Box>
            <ToggleOption
              value={flashcardObject.useAdvancedMode}
              setValue={(newValue) =>
                setFlashcardObject((prevSettings) => ({
                  ...prevSettings,
                  useAdvancedMode: newValue,
                }))
              }
              isSwitch={true}
              tooltipTitle="Advanced mode"
              tooltipPlacement="top"
            />
          </Box>
          {availableCards === 0 && (
            <Typography variant="body1" sx={{ color: "red", bgcolor: "rgba(255, 0, 0, 0.2)", p: 1, borderRadius: 1 }}>
              No flashcards available with current settings.
            </Typography>
          )}
          <Button
            variant="contained"
            disabled={availableCards === 0}
            sx={{ bgcolor: "green" }}
            onClick={() =>
              setFlashcardObject((prev) => ({
                ...prev,
                settingsOpen: false,
              }))
            }
          >
            Start
          </Button>
          <Button
            variant="contained"
            onClick={() => onAppExit()}
            sx={{ bgcolor: "#36454F" }}
          >
            Exit
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default FlashcardSettings;
