import { useState, useRef } from "react";
import Flashcard from "./Flashcard";
import { Box, Button, Fade, Typography } from "@mui/material";
import MoveIcons from "./MoveIcons";
import Progressbar from "./Progressbar";

const FlashcardMode = ({ wordGroups, onExit, modeName = "Flashcards" }) => {
  const [selectedIndex, setSelectedIndex] = useState(0); // Track current index
  const [fadeIn, setFadeIn] = useState(true); // Control fade-in animation
  const [cardsCompleted, setCardsCompleted] = useState([]); // Track completed cards
  const maxIndex = wordGroups.length - 1;
  const resetIndexesRef = useRef(null);
  const handleIndexChange = (newIndex) => {
    setFadeIn(false);
    setTimeout(() => {
      resetIndexesRef.current && resetIndexesRef.current(); // reset card indexes so new card starts from the first translation
      setSelectedIndex(newIndex);
      setFadeIn(true);
    }, 500); // Wait for the fade-out animation to finish before changing the card
  };

  // using the unique id of the word group to track completed cards
  // flashcard calls this function when the card is completed
  // and this marks it as completed if it was not already
  const handleCardComplete = () => {
    const id = wordGroups[selectedIndex].id;
    const alreadyCompleted = cardsCompleted.find((card) => card.id === id);
    if (!alreadyCompleted) {
      setCardsCompleted([...cardsCompleted, { id }]);
    }
  };
  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 3,
          alignItems: "center",
          mt: 5,
          p: 3,
          backgroundColor: "#f4f6f9",
          borderRadius: "10px",
          boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
          maxWidth: "800px",
          width: "100%",
        }}
      >
        <Typography
          sx={{
            fontWeight: "bold",
            color: "#2c3e50",
            textAlign: "center",
            marginBottom: 2,
            fontSize: { xs: "2rem", sm: "2.5rem" }, // slightly smaller font size on small screens
          }}
        >
          {modeName === "Flashcards" ? "Flashcards 📖" : "Carousel cards 🎠"}
        </Typography>
        <Fade in={fadeIn} timeout={500} mountOnEnter unmountOnExit>
          <div style={{ width: "100%" }}>
            <Flashcard
              translations={modeName === "Flashcards" ? wordGroups[selectedIndex] : wordGroups[selectedIndex].translations}
              resetIndexesRef={resetIndexesRef}
              handleCardComplete={handleCardComplete}
              mode={modeName}
            />
          </div>
        </Fade>
        <Box sx={{ display: "flex", width: "90%", maxWidth: "400px" }}>
          <MoveIcons
            currentIndex={selectedIndex}
            maxIndex={maxIndex}
            onClick={(newIndex) => handleIndexChange(newIndex)}
            alternativeIcons={true}
          />
        </Box>
        <Progressbar
          total={maxIndex + 1}
          completed={cardsCompleted.length}
          boxStyle={{
            width: "90%",
            maxWidth: "400px",
            backgroundColor: "#ecf0f1",
            borderRadius: "20px",
          }}
          barStyle={{
            height: "30px",
            borderRadius: "15px",
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "#7f8c8d",
            textAlign: "center",
          }}
        >
          {`Progress: ${cardsCompleted.length} / ${maxIndex + 1} ${
            cardsCompleted.length === maxIndex + 1 ? "🎉" : ""
          }`}
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={onExit}
          sx={{
            width: "50%",
            maxWidth: "200px",
            height: "50px",
            borderRadius: "25px",
            "&:hover": {
              transform: "scale(1.05)",
            },
          }}
        >
          Exit
        </Button>
      </Box>
    </Box>
  );
};

export default FlashcardMode;
