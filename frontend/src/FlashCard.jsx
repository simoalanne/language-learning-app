import { useState, useRef } from "react";
import { Typography, Box } from "@mui/material";
import "./Flashcard.css";

const Flashcard = ({
  translations,
  resetIndexesRef,
  handleCardComplete,
  mode,
}) => {
  console.log("flashcard translations", translations);
  console.log("flashcard mode", mode);
  const [flipState, setFlipState] = useState(0);
  const [frontIndex, setfrontIndex] = useState(0);
  const [backIndex, setbackIndex] = useState(0);
  const [index, setIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const disableTransition = useRef(null);

  if (resetIndexesRef)
    resetIndexesRef.current = () => {
      disableTransition.current = true;
      setfrontIndex(0);
      setbackIndex(0);
      setIndex(0);
      setFlipState(0);
      setTimeout(() => (disableTransition.current = false), 0);
    };

  const handleFlip = () => {
    if (isFlipping) return;
    setIsFlipping(true);

    if (mode === "Flashcards") {
      handleCardComplete();
      setFlipState((prev) => (prev === 0 ? 180 : 0));
      setTimeout(() => {
        setIsFlipping(false);
      }, 600);
      return;
    }

    const flipDirection = 180; // Always flip by 180 degrees, no matter where clicked

    if (index === translations.length - 1) {
      // Reset to the first card but flip forward
      const isFrontside = flipState % 360 === 0;

      if (isFrontside) {
        setTimeout(() => {
          setfrontIndex(0); // Reset front index
        }, 300);
        setbackIndex(0); // Immediately reset back index
      } else {
        setTimeout(() => {
          setbackIndex(0); // Reset back index
        }, 300);
        setfrontIndex(0); // Immediately reset front index
      }
      setIndex(0);
      setFlipState((prev) => prev + flipDirection); // Flip forward even when resetting
      setTimeout(() => {
        setIsFlipping(false);
      }, 600); // Wait until the flip is complete before finishing the reset
      return;
    }

    const isFrontside = flipState % 360 === 0;

    if (isFrontside) {
      setTimeout(() => {
        setfrontIndex((prev) => prev + 1);
      }, 300);
      setbackIndex((prev) => prev + 1);
    } else {
      setTimeout(() => {
        setbackIndex((prev) => prev + 1);
      }, 300);
      setfrontIndex((prev) => prev + 1);
    }

    if (index === translations.length - 2) handleCardComplete();
    setFlipState((prev) => prev + flipDirection);
    setIndex((prev) => prev + 1);
    setTimeout(() => {
      setIsFlipping(false);
    }, 600);
  };

  return (
    <>
      {mode === "Carousel Cards" && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Box
            className={`card ${isFlipping ? "cardFlipping" : ""}`}
            onClick={handleFlip}
          >
            <div
              className="cardInner"
              style={{
                transform: `rotateY(${flipState}deg)`,
                transition: disableTransition.current
                  ? "none"
                  : "transform 0.6s",
              }}
            >
              <div
                className="cardFront"
                style={{
                  backgroundImage: `url(${translations[frontIndex].languageName}.svg)`,
                }}
              >
                <Typography variant="h5" className="cardContent">
                  {translations[frontIndex].word}
                </Typography>
                <Typography className="cardFooter">
                  {`${frontIndex + 1} of ${translations.length}`}
                </Typography>
              </div>
              <div
                className="cardBack"
                style={{
                  backgroundImage: `url(${translations[backIndex].languageName}.svg)`,
                }}
              >
                <Typography variant="h5" className="cardContent">
                  {translations[backIndex].word}
                </Typography>
                <Typography className="cardFooter">
                  {`${backIndex + 1} of ${translations.length}`}
                </Typography>
              </div>
            </div>
          </Box>
        </Box>
      )}

      {mode === "Flashcards" && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Box
            className={`card ${isFlipping ? "cardFlipping" : ""}`}
            onClick={handleFlip}
          >
            <div
              className="cardInner"
              style={{
                transform: `rotateY(${flipState}deg)`,
                transition: disableTransition.current
                  ? "none"
                  : "transform 0.6s",
              }}
            >
              <div
                className="cardFront"
                style={{
                  backgroundImage: `url(${translations.sourceLanguage}.svg)`,
                }}
              >
                <Typography variant="h5" className="cardContent">
                  {translations.sourceWord}
                </Typography>
              </div>
              <div
                className="cardBack"
                style={{
                  backgroundImage: `url(${translations.targetLanguage}.svg)`,
                }}
              >
                <Typography variant="h5" className="cardContent">
                  {translations.targetWord}
                </Typography>
              </div>
            </div>
          </Box>
        </Box>
      )}
    </>
  );
};

export default Flashcard;
