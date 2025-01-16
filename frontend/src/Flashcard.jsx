import { useState, useRef } from "react";
import { Typography, Box } from "@mui/material";
import "./Flashcard.css";

const Flashcard = ({
  translations,
  resetIndexesRef,
}) => {
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

    const flipDirection = 180;

    if (index === translations.length - 1) {
      const isFrontside = flipState % 360 === 0;

      if (isFrontside) {
        setTimeout(() => {
          setfrontIndex(0);
        }, 300);
        setbackIndex(0);
      } else {
        setTimeout(() => {
          setbackIndex(0);
        }, 300);
        setfrontIndex(0);
      }
      setIndex(0);
      setFlipState((prev) => prev + flipDirection);
      setTimeout(() => {
        setIsFlipping(false);
      }, 600);
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

    setFlipState((prev) => prev + flipDirection);
    setIndex((prev) => prev + 1);
    setTimeout(() => {
      setIsFlipping(false);
    }, 600);
  };

  return (
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
  );
};

export default Flashcard;