import { useState, useRef } from "react";
import Flashcard from "./Flashcard";
import { Box, Button, Fade, TextField, Typography } from "@mui/material";
import MoveIcons from "./MoveIcons";
import ContentAligner from "./ContentAligner";
import useWordgroups from "./hooks/useWordgroups";
import { useNavigate } from "react-router-dom";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

const FlashcardMode = () => {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0); // Track current index
  const [fadeIn, setFadeIn] = useState(true); // Control fade-in animation
  const { wordgroups, loading } = useWordgroups();
  const resetIndexesRef = useRef(null);
  const [inputIndex, setInputIndex] = useState("");

  const handleIndexChange = (newIndex) => {
    setFadeIn(false);
    setTimeout(() => {
      resetIndexesRef.current && resetIndexesRef.current(); // reset card indexes so new card starts from the first translation
      setSelectedIndex(newIndex);
      setFadeIn(true);
    }, 500); // Wait for the fade-out animation to finish before changing the card
  };

  const handleGoToIndex = () => {
    const index = parseInt(inputIndex) - 1;
    if (!isNaN(index) && index >= 0 && index < wordgroups.length) {
      handleIndexChange(index);
    }
  };

  if (loading) return null;
  const maxIndex = wordgroups.length - 1;
  console.log(wordgroups);
  return (
    <ContentAligner sx={{ gap: 3 }}>
      <Box sx={{ display: "flex", gap: 1 }}>
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
        <Button
          variant="contained"
          sx={{ bgcolor: "#36454F" }}
          onClick={() =>
            handleIndexChange(Math.floor(Math.random() * maxIndex))
          }
        >
          Random card
        </Button>
      </Box>
      {wordgroups.length > 0 && (
        <Fade in={fadeIn} timeout={500} mountOnEnter unmountOnExit>
          <div style={{ width: "100%" }}>
            <Flashcard
              translations={wordgroups[selectedIndex].translations}
              resetIndexesRef={resetIndexesRef}
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
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
        Move to any number
      </Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          autoComplete="off"
          variant="outlined"
          label={`1 - ${wordgroups.length}`}
          value={inputIndex}
          onChange={(e) =>
            // if not number don't allow input
            !isNaN(e.target.value) && setInputIndex(e.target.value)
          }
        />
        <Button variant="contained" onClick={handleGoToIndex} sx={{ bgcolor: "#36454F" }}>
          Go
        </Button>
      </Box>
    </ContentAligner>
  );
};

export default FlashcardMode;
