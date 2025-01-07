import { useState, useRef } from "react";
import { Typography, Box } from "@mui/material";
import "./FlashCard.css";

const FlashCard = ({ translations, resetIndexesRef, handleCardComplete }) => {
  const [flipState, setFlipState] = useState(0);
  const [partialFlipDegree, setPartialFlipDegree] = useState(0);
  const cardRef = useRef(null);
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
      setPartialFlipDegree(0);
      setTimeout(() => (disableTransition.current = false), 0);
    };

  const determineSide = (e) => {
    const cardWidth = cardRef.current.getBoundingClientRect().width;
    const cardLeft = cardRef.current.getBoundingClientRect().left;
    const clickPosition = e.clientX - cardLeft;
    return clickPosition < cardWidth / 2 ? -1 : 1;
  };

  const handleFlip = (e) => {
    if (isFlipping) return;
    setIsFlipping(true);
    const flipDirection = determineSide(e) * 180;
    if (index === 0 && flipDirection === -180) {
      setIsFlipping(false);
      return;
    }
    if (index === translations.length - 1 && flipDirection === 180) {
      setIsFlipping(false);
      return;
    }

    const isFrontside = flipState % 360 === 0;

    if (isFrontside) {
      setTimeout(() => {
        setfrontIndex((prev) => (flipDirection === 180 ? prev + 1 : prev - 1));
      }, 300);
      setbackIndex((prev) => (flipDirection === 180 ? prev + 1 : prev - 1));
    } else {
      setTimeout(() => {
        setbackIndex((prev) => (flipDirection === 180 ? prev + 1 : prev - 1));
      }, 300);
      setfrontIndex((prev) => (flipDirection === 180 ? prev + 1 : prev - 1));
    }

    setFlipState((prev) => prev + flipDirection);
    setIndex((prev) => (flipDirection === 180 ? prev + 1 : prev - 1));
    setTimeout(() => setIsFlipping(false), 600);
  };

  const handleMouseMove = (e) => {
    const partialFlipDirection = determineSide(e) * 20;
    if (partialFlipDegree !== partialFlipDirection) {
      setPartialFlipDegree(partialFlipDirection);
    }
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const partialFlipDirection = determineSide(touch) * 10;
    if (partialFlipDegree !== partialFlipDirection) {
      setPartialFlipDegree(partialFlipDirection);
    }
  };

  return (
    <Box className="cardContainer">
    <Box
      className={`card ${isFlipping && "cardFlipping"}`}
      onClick={(e) => {
        handleFlip(e);
        if (index === translations.length - 2) {
          handleCardComplete();
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => partialFlipDegree !== 0 && setPartialFlipDegree(0)}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => partialFlipDegree !== 0 && setPartialFlipDegree(0)}
      ref={cardRef}
    >
      <div
        className="cardInner"
        style={{
          transform: `rotateY(${flipState + partialFlipDegree}deg)`,
          transition: disableTransition.current ? "none" : "transform 0.6s",
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

export default FlashCard;
