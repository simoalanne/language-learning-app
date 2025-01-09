import MatchingGameCard from "./MatchingGameCard";
import {
  Box,
  Typography,
  Button,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { useState, useEffect } from "react";
import Progressbar from "./Progressbar";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";

const MatchingGameMode = ({
  questions,
  answers,
  onExit,
  sourceLanguage,
  targetLanguage,
}) => {
  const [flippedCards, setFlippedCards] = useState([]); // store the indexes of the flipped cards
  const [matchedCards, setMatchedCards] = useState([]); // store the indexes of the matched cards
  const [combined, setCombined] = useState([]); // Store the combined cards
  const [moveCount, setMoveCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [openedPairIsMatch, setOpenedPairIsMatch] = useState(false);
  const [timer, setTimer] = useState(null);
  const [cardScale, setCardScale] = useState(1);

  useEffect(() => {
    // prevent this from running if there are no questions or answers meaning the game is not ready
    if (questions.length === 0 || answers.length === 0) return;
    // Map the questions and answers to a single array of objects
    // use the questions and answers array indexes as the id
    // that way they can easily be compared if they are a match
    const combinedCards = [
      ...questions.map((q, i) => ({ id: i, content: q })),
      ...answers.map((a, i) => ({ id: i, content: a[0] })), // answers includes synonyms so only grab the first word
    ];

    for (let i = combinedCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combinedCards[i], combinedCards[j]] = [
        combinedCards[j],
        combinedCards[i],
      ];
    }

    const shuffledCards = combinedCards.map((card, i) => ({
      ...card,
      uniqueId: `${card.id}-${i}`,
    })); // separate unique id so don't need to use the index as key
    console.log("cards are shuffled", shuffledCards);
    setCombined(shuffledCards);
  }, [questions, answers]);

  useEffect(() => {
    const intervalId = setInterval(
      () => setTimer((t) => t + (confirmationOpen ? 0 : 1)),
      1000
    );
    return () => clearInterval(intervalId);
  }),
    [];

  const handleClick = (index) => {
    console.log("clicked word", combined[index]);
    if (flippedCards.length === 2 || flippedCards.includes(index)) return;
    const currentFlipped = [...flippedCards];
    setFlippedCards([...flippedCards, index]);
    if (currentFlipped.length !== 1) return;
    setMoveCount(moveCount + 1);
    setTimeout(() => askConfirmation([flippedCards[0], index]), 600);
  };

  const askConfirmation = (indexes) => {
    setConfirmationOpen(true);
    if (combined[indexes[0]].id === combined[indexes[1]].id) {
      setOpenedPairIsMatch(true);
    }
  };

  const handleNo = () => {
    setConfirmationOpen(false);
    setFlippedCards([]);
    if (openedPairIsMatch) {
      setMistakeCount(mistakeCount + 1);
    }
    setOpenedPairIsMatch(false);
  };

  const handleYes = () => {
    setConfirmationOpen(false);
    if (openedPairIsMatch) {
      setMatchedCards([...matchedCards, ...flippedCards]);
    }
    if (!openedPairIsMatch) {
      setMistakeCount(mistakeCount + 1);
    }
    setFlippedCards([]);
    setOpenedPairIsMatch(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        mt: 5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 1,
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "primary.main",
          borderRadius: 10,
          padding: 1,
          mb: 2,
        }}
      >
        <IconButton
          onClick={() => setCardScale(cardScale - 0.25)}
          disabled={cardScale === 0.5}
        >
          <RemoveIcon />
        </IconButton>
        <Typography variant="body1">{`Zoom: ${cardScale * 100}%`}</Typography>
        <IconButton
          onClick={() => setCardScale(cardScale + 0.25)}
          disabled={cardScale === 1.5}
        >
          <AddIcon />
        </IconButton>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 2,
          width: "95%",
          maxWidth: 1200,
        }}
      >
        {combined.map((c, index) => (
          <MatchingGameCard
            key={c.uniqueId}
            backsideContent={c.content}
            languageName={
              index < questions.length ? sourceLanguage : targetLanguage
            }
            index={index}
            isFlipped={
              flippedCards.includes(index) || matchedCards.includes(index)
            }
            isSelected={flippedCards.includes(index)}
            handleClick={handleClick}
            cardScale={cardScale}
          />
        ))}
      </Box>
      <Typography variant="h6" sx={{ mt: 2 }}>
        Moves: {moveCount}
      </Typography>
      <Typography variant="h6">Mistakes: {mistakeCount}</Typography>
      <Typography variant="h6">{`Time: ${timer || 0} seconds`}</Typography>
      <Typography variant="h6">
        Completion: {`${matchedCards.length / 2}/${combined.length / 2}`}
      </Typography>
      <Progressbar
        completed={matchedCards.length}
        total={combined.length}
        boxStyle={{ width: "50%", maxWidth: 500 }}
        barStyle={{ height: 20, borderRadius: 10 }}
      />
      <Button
        variant="contained"
        onClick={onExit}
        sx={{
          width: 200,
          borderRadius: 10,
          "&:hover": { transform: "scale(1.1)" },
        }}
        color="secondary"
      >
        Exit
      </Button>
      <Dialog open={confirmationOpen} onClose={() => handleNo()}>
        <DialogTitle>Do these words match?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: "center" }}>
            {combined[flippedCards[0]]?.content} and{" "}
            {combined[flippedCards[1]]?.content}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button
            onClick={() => handleNo()}
            sx={{
              backgroundColor: "#d32f2f",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#b71c1c",
              },
              padding: "8px 20px",
              borderRadius: "4px",
              fontWeight: 600,
            }}
          >
            No
          </Button>
          <Button
            onClick={() => handleYes()}
            sx={{
              backgroundColor: "#388e3c",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#2c6e2c",
              },
              padding: "8px 20px",
              borderRadius: "4px",
              fontWeight: "bold",
            }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MatchingGameMode;
