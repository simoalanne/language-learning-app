import { useState, useRef } from "react";
import Flashcard from "./Flashcard";
import { Box, Button, Fade } from "@mui/material";
import MoveIcons from "./MoveIcons";
import ContentAligner from "./ContentAligner";
import useWordgroups from "./hooks/useWordgroups";
import { useNavigate } from "react-router-dom";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import FlashcardSettings from "./FlashcardSettings";
import { filterWordGroupsByLanguagesAndTags } from "./util/helpers";

const FlashcardMode = () => {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0); // Track current index
  const [fadeIn, setFadeIn] = useState(true); // Control fade-in animation
  const { wordgroups, loading } = useWordgroups();
  const maxIndex = wordgroups?.length - 1;
  const resetIndexesRef = useRef(null);
  const handleIndexChange = (newIndex) => {
    setFadeIn(false);
    setTimeout(() => {
      resetIndexesRef.current && resetIndexesRef.current(); // reset card indexes so new card starts from the first translation
      setSelectedIndex(newIndex);
      setFadeIn(true);
    }, 500); // Wait for the fade-out animation to finish before changing the card
  };
  const [flashcardObject, setFlashcardObject] = useState({
    settingsOpen: true,
    selectedLanguages: ["English", "Finnish"],
    useAdvancedMode: false,
    cards: 20,
  });

  const availableCards = filterWordGroupsByLanguagesAndTags(
    wordgroups,
    flashcardObject.selectedLanguages,
    []
  );

  if (loading) return null;
  console.log(wordgroups);
  return (
    <ContentAligner sx={{ gap: 3 }}>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          onClick={() =>
            setFlashcardObject((prev) => ({
              ...prev,
              settingsOpen: true,
            }))
          }
          variant="contained"
          color="primary"
          disableElevation
          sx={{
            bgcolor: "#36454F",
            fontSize: 14,
            fontWeight: "bold",
            textTransform: "none",
            borderRadius: 1,
          }}
          endIcon={<SettingsIcon fontSize="12" />}
        >
          Settings
        </Button>
        <Button
          variant="contained"
          color="primary"
          disableElevation
          sx={{
            bgcolor: "#36454F",
            fontSize: 14,
            fontWeight: "bold",
            textTransform: "none",
            borderRadius: 1,
          }}
          endIcon={<ExitToAppIcon />}
          onClick={() => navigate("/learn")}
        >
          Exit
        </Button>
      </Box>
      {wordgroups.length > 0 && (
        <Fade in={fadeIn} timeout={500} mountOnEnter unmountOnExit>
          <div style={{ width: "100%" }}>
            <Flashcard
              translations={wordgroups[selectedIndex]?.translations}
              resetIndexesRef={resetIndexesRef}
              useAdvancedMode={flashcardObject.useAdvancedMode}
            />
          </div>
        </Fade>
      )}
      <Box sx={{ display: "flex", width: "90%", maxWidth: "400px" }}>
        <MoveIcons
          currentIndex={selectedIndex}
          maxIndex={maxIndex}
          onClick={(newIndex) => handleIndexChange(newIndex)}
          alternativeIcons={true}
        />
      </Box>
      <Button
        variant="contained"
        sx={{ bgcolor: "#36454F" }}
        onClick={() => handleIndexChange(Math.floor(Math.random() * maxIndex))}
      >
        Random card
      </Button>
      <FlashcardSettings
        flashcardObject={flashcardObject}
        setFlashcardObject={setFlashcardObject}
        onAppExit={() => navigate("/learn")}
        availableCards={availableCards.length}
      />
    </ContentAligner>
  );
};

export default FlashcardMode;
