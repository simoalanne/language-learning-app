import {
  Dialog,
  DialogContent,
  Box,
  Button,
  Typography,
  Slider,
} from "@mui/material";
import SelectLanguagePair from "./SelectLanguagePair";
import ToggleOption from "./ToggleOption";
import SelectTags from "./SelectTags";
import { useContext } from "react";
import { AuthContext } from "./Authorisation/AuthContext";

const MatchingGameSettings = ({
  open,
  handleClose,
  settings,
  setSettings,
  availablePairs,
  handleCancel,
  handleExitToApp,
  availablePairsWithoutFilters,
  pairsPerTag,
}) => {
  const { isAuthenticated } = useContext(AuthContext);
  return (
    <Dialog
      open={open}
      fullWidth
      // user can only close the dialog if the game has been started at least once
      // otherwise the user has to confirm the settings and start the game via button click
      onClose={
        settings.gameStartedAtLeastOnce
          ? handleCancel
          : () =>
              setSettings((prevSettings) => ({
                ...prevSettings,
                settingsOpen: true,
              }))
      }
    >
      <DialogContent>
        <Typography variant="h5" sx={{ fontWeight: "bold", ml: 2, my: 2 }}>
          Matching game settings
        </Typography>
        {availablePairsWithoutFilters < 2 && (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexDirection: "column", ml: 2 }}>
          <Box sx={{ bgcolor: "rgba(255, 0, 0, 0.1)", p: 1, borderRadius: 1, color: "red" }}>
            <Typography variant="body2">
              Not enough pairs available to play the game. Please add more
              translations.
            </Typography>
          </Box>
          <Button
            onClick={handleExitToApp}
            variant="contained"
            sx={{ bgcolor: "#36454F", color: "white" }}
          >
            Exit to mode selection
          </Button>
          </Box>
        )}
        {availablePairsWithoutFilters >= 2 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            py: 1,
            mx: 2,
            gap: 2,
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            Select language pair
          </Typography>
          <SelectLanguagePair
            labels={["", ""]}
            // when user isnt logged in, only allow English, Finnish and Swedish since these contain the public translations
            // this ensures that user can't choose a configuration that would result in the game not being playable
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
            selectedLanguages={settings.selectedLanguages}
            allowSameLanguages={true}
            setSelectedLanguages={(newSelectedLanguages) =>
              setSettings((prevSettings) => ({
                ...prevSettings,
                selectedLanguages: newSelectedLanguages,
                confirmMatch:
                  newSelectedLanguages[0] === newSelectedLanguages[1]
                    ? false
                    : prevSettings.confirmMatch,
              }))
            }
          />
          {settings.availableTags.length > 0 && (
          <>
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            Filtering options
          </Typography>
          <Typography variant="body2">
            pair must have at least one of the selected tags to be included in
            the game. The number in parentheses indicates how many pairs are
            available with the tag.
          </Typography>
          <SelectTags
            wordsAvailableForTags={pairsPerTag}
            useCollapseMode={false}
            tags={settings.availableTags}
            selectedTags={settings.selectedTags}
            setSelectedTags={(newSelectedTags) =>
              setSettings((prevSettings) => ({
                ...prevSettings,
                selectedTags: newSelectedTags,
              }))
            }
          />
          </>
          )}
          {availablePairs <= 1 && (
            <>
              <Box
                sx={{
                  width: "100%",
                  bgcolor: "rgba(255, 0, 0, 0.1)",
                  p: 1,
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" color="error">
                  Not enough pairs available with current filters and selected
                  language pair. Please adjust the settings or add more
                  tranlations
                </Typography>
              </Box>
              <Button
                onClick={handleExitToApp}
                variant="contained"
                sx={{ bgcolor: "#36454F", color: "white" }}
              >
                Exit to mode selection
              </Button>
            </>
          )}
          {availablePairs > 1 && (
            <>
              {/* confirming matches is only possible with two different languages for obvious reasons */}
              {settings.selectedLanguages[0] !==
                settings.selectedLanguages[1] && (
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
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
                        Confirm match
                      </Typography>
                      <Typography variant="body2">
                        With confirm match enabled, you will have to confirm
                        each match before the cards stay flipped. If you answer
                        incorrectly, the cards will flip back and you will have
                        to try again.
                      </Typography>
                    </Box>
                    <ToggleOption
                      value={settings.confirmMatch}
                      setValue={(newValue) =>
                        setSettings((prevSettings) => ({
                          ...prevSettings,
                          confirmMatch: newValue,
                        }))
                      }
                      isSwitch={true}
                      tooltipTitle="confirm match"
                      tooltipPlacement="top"
                    />
                  </Box>
                </Box>
              )}
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                {availablePairs === 2 ? "Number of pairs 2" : `Select the number of pairs between 2 and ${availablePairs}`}
              </Typography>
              <Slider
                disabled={availablePairs === 2}
                value={settings.pairs}
                min={Math.min(2, availablePairs)}
                max={availablePairs}
                step={1}
                onChange={(_, newValue) =>
                  setSettings((prevSettings) => ({
                    ...prevSettings,
                    pairs: newValue,
                  }))
                }
                valueLabelDisplay={availablePairs === 2 ? "off" : "on"}
                sx={{
                  mt: availablePairs === 2 ? 0 : 2,
                }}
                valueLabelFormat={(value) => `${value} pairs`}
              />
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  bgcolor: "rgba(0, 200, 0, 0.2)",
                  p: 1,
                  borderRadius: 1,
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  Customization
                </Typography>
                <ToggleOption
                  value={settings.hideTimer}
                  setValue={(newValue) =>
                    setSettings((prevSettings) => ({
                      ...prevSettings,
                      hideTimer: newValue,
                    }))
                  }
                  label="Hide timer"
                  isSwitch={true}
                />
                <ToggleOption
                  label={"Hide moves"}
                  value={settings.hideMoves}
                  setValue={(newValue) =>
                    setSettings((prevSettings) => ({
                      ...prevSettings,
                      hideMoves: newValue,
                    }))
                  }
                  isSwitch={true}
                />
                <ToggleOption
                  label={"Hide mistakes"}
                  value={settings.hideMistakes}
                  setValue={(newValue) =>
                    setSettings((prevSettings) => ({
                      ...prevSettings,
                      hideMistakes: newValue,
                    }))
                  }
                  isSwitch={true}
                />
              </Box>
              <Button
                onClick={handleClose}
                variant="contained"
                sx={{ bgcolor: "#2E7D32", color: "white" }}
              >
                {settings.gameStartedAtLeastOnce
                  ? "Restart with current settings"
                  : "Start game"}
              </Button>
              {settings.gameStartedAtLeastOnce ? (
                <Button
                  onClick={handleCancel}
                  variant="contained"
                  sx={{ bgcolor: "#36454F", color: "white" }}
                >
                  Cancel and keep current game
                </Button>
              ) : (
                <Button
                  onClick={handleExitToApp}
                  variant="contained"
                  sx={{ bgcolor: "#36454F", color: "white" }}
                >
                  Exit to mode selection
                </Button>
              )}
            </>
          )}
        </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MatchingGameSettings;
