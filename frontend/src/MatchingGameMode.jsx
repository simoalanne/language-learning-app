import MatchingGameCard from "./MatchingGameCard";
import {
  Box,
  Typography,
  Button,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { useState, useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import useWordgroups from "./hooks/useWordgroups";
import ContentAligner from "./ContentAligner";
import MatchingGameSettings from "./MatchingGameSettings";
import { shuffle } from "./util/helpers";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate } from "react-router-dom";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

const MatchingGameMode = () => {
  const [flippedCards, setFlippedCards] = useState([]); // store the indexes of the flipped cards
  const [matchedCards, setMatchedCards] = useState([]); // store the indexes of the matched cards
  const [combined, setCombined] = useState([]); // Store the combined cards
  const [moveCount, setMoveCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [openedPairIsMatch, setOpenedPairIsMatch] = useState(false);
  const [timer, setTimer] = useState(null);
  const [cardScale, setCardScale] = useState(1);
  const { wordgroups, loading } = useWordgroups();
  const [settings, setSettings] = useState({
    open: true,
    gameStartedAtLeastOnce: false, // changes the initial message of the button from start and restart
    selectedLanguages: ["English", "Finnish"],
    confirmMatch: false,
    pairs: 0,
    hideTimer: false,
    hideMoves: false,
    hideMistakes: false,
    initialized: false,
    selectedTags: [],
    availableTags: [],
    dontReset: false,
  });
  const navigate = useNavigate();

  const gameFinished =
    matchedCards.length === combined.length && combined.length > 0;
  const availablePairsWithoutFilters = wordgroups.length;

  const newWordGroups = [...wordgroups];
  // create a new array for each available tag. then include the wordgroups that have the tag in the array
  // and also have both selected languages
  const wordgroupsByTags = settings.availableTags.map(
    (tag) =>
      newWordGroups.filter(
        (wg) =>
          wg.tags.includes(tag) &&
          settings.selectedLanguages.every((lang) =>
            wg.translations.map((t) => t.languageName).includes(lang)
          )
      ).length
  );

  let availablePairs = wordgroups.filter(
    (wg) =>
      settings.selectedLanguages.every((lang) =>
        wg.translations.map((t) => t.languageName).includes(lang)
      ) &&
      (settings.selectedTags.length === 0 ||
        settings.selectedTags.some((tag) => wg.tags.includes(tag)))
  );


  availablePairs = Math.min(availablePairs.length, 25);

  const handleCancel = () => {
    setSettings({ ...settings, open: false, dontReset: true });
  };

  useEffect(() => {
    if (loading) return;

    // initialize settings only once
    if (!settings.initialized) {
      setSettings((prevSettings) => ({
        ...prevSettings,
        pairs: Math.min(10, wordgroups.length),
        initialized: true,
        availableTags: [...new Set(wordgroups.flatMap((wg) => wg.tags))],
      }));
    }

    // don't run rest of the code if the settings dialog is open. no need to shuffle and modify the cards if the user is still selecting settings
    // this still needs to run up to this part to correctly update the available pairs
    if (settings.open || settings.dontReset) {
      return;
    }

    // select selected amount of pairs randomly from the available pairs
    // use set and while loop and wait until the set is filled with the correct amount of pairs
    const newWordGroups = new Set();
    while (newWordGroups.size < settings.pairs) {
      const randomIndex = Math.floor(Math.random() * wordgroups.length);
      newWordGroups.add(wordgroups[randomIndex]);
    }

    // convert set back to array
    const shortened = [...newWordGroups];

    // get the translations of the first selected language
    const cards1 = shortened.map(
      (wg) =>
        wg.translations.find(
          (lang) => lang.languageName === settings.selectedLanguages[0]
        ).word
    );

    // get the translations of the second selected language
    const cards2 = shortened.map(
      (wg) =>
        wg.translations.find(
          (lang) => lang.languageName === settings.selectedLanguages[1]
        ).word
    );

    // combine the two arrays into matching pairs. the id is used to check if the cards match
    // id is the index of the wordgroup in the shortened array so two tranlations from the same wordgroup have the same id
    // and therefore match
    let combinedCards = [
      ...cards1.map((q, i) => ({ id: i, content: q })),
      ...cards2.map((a, i) => ({ id: i, content: a })),
    ];

    // shuffle the cards so they aren't next to each other in the matching game
    combinedCards = shuffle(combinedCards);

    // add unique id to each card so key doesn't have to be the index
    combinedCards = combinedCards.map((card, i) => ({
      ...card,
      uniqueId: `${card.id}-${i}`,
    }));
    // finally set the state of the matching game
    setCombined(combinedCards);
  }, [loading, wordgroups, settings]);

  useEffect(() => {
    const intervalId = setInterval(
      () =>
        setTimer(
          (t) => t + (confirmationOpen || settings.open || gameFinished ? 0 : 1)
        ),
      1000
    );
    return () => clearInterval(intervalId);
  }),
    [];

  const handleClick = (index) => {
    if (flippedCards.length === 2 || flippedCards.includes(index)) return;
    const currentFlipped = [...flippedCards];
    setFlippedCards([...flippedCards, index]);
    if (currentFlipped.length !== 1) return;
    setMoveCount(moveCount + 1);
    setTimeout(
      () =>
        settings.confirmMatch
          ? askConfirmation([flippedCards[0], index])
          : handlePairMatch([flippedCards[0], index]),
      500
    );
  };

  const handlePairMatch = (indexes) => {
    if (combined[indexes[0]].id === combined[indexes[1]].id) {
      setMatchedCards([...matchedCards, ...indexes]);
    }
    setFlippedCards([]);
  };

  const askConfirmation = (indexes) => {
    if (combined[indexes[0]].id === combined[indexes[1]].id) {
      setOpenedPairIsMatch(true);
    }
    setConfirmationOpen(true);
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

  // formats to mm:ss
  const formatTime = (time) => {
    const hours = Math.floor(time / 3600); // not that anyone will play this for an hour but its visually better
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours < 10 ? "0" : ""}${hours} : ${
      minutes < 10 ? "0" : ""
    }${minutes} : ${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleExitToApp = () => {
    navigate("/learn");
  };

  return (
    <ContentAligner background="url(style1.png)">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: { xs: 0.5, sm: 1 },
            alignItems: "center",
            bgcolor: "white",
            boxShadow: 2,
            py: 2,
            px: 1,
            width: "95%",
            maxWidth: 1000,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 1,
            }}
          >
            {!settings.hideMistakes && (
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  color: "#fff",
                  bgcolor: "#36454F",
                  borderRadius: 1,
                  p: 1,
                  userSelect: "none",
                }}
              >
                Mistakes: {mistakeCount}
              </Typography>
            )}
            {!settings.hideMoves && (
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  color: "#fff",
                  bgcolor: "#36454F",
                  borderRadius: 1,
                  p: 1,
                  userSelect: "none",
                }}
              >
                Moves: {moveCount}
              </Typography>
            )}
            {!settings.hideTimer && (
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  color: "#fff",
                  bgcolor: "#36454F",
                  borderRadius: 1,
                  p: 1,
                  userSelect: "none",
                }}
              >
                {formatTime(timer)}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: "#36454F",
                borderRadius: 1,
              }}
            >
              <IconButton
                onClick={() => setCardScale(cardScale - 0.25)}
                disabled={cardScale === 0.5}
                sx={{
                  color: "#fff",
                  p: 1,
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
                  "&:disabled": { color: "rgba(255, 255, 255, 0.5)" },
                }}
              >
                <RemoveIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", color: "#fff" }}
              >
                {`${cardScale * 100}%`}
              </Typography>
              <IconButton
                sx={{
                  color: "#fff",
                  p: 1,
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
                  "&:disabled": { color: "rgba(255, 255, 255, 0.5)" },
                }}
                onClick={() => setCardScale(cardScale + 0.25)}
                disabled={cardScale === 1.25}
              >
                <AddIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
            <Button
              onClick={() => setSettings({ ...settings, open: true })}
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
              onClick={() => handleExitToApp()}
            >
              Exit
            </Button>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 1,
            width: "95%",
            maxWidth: 1000,
          }}
        >
          {combined.map((c, index) => (
            <MatchingGameCard
              key={c.uniqueId}
              backsideContent={c.content}
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
      <MatchingGameSettings
        availablePairsWithoutFilters={availablePairsWithoutFilters}
        pairsPerTag={wordgroupsByTags}
        handleExitToApp={handleExitToApp}
        handleCancel={handleCancel}
        availablePairs={availablePairs}
        open={settings.open}
        handleClose={() => {
          setSettings({
            ...settings,
            open: false,
            gameStartedAtLeastOnce: true,
            dontReset: false,
          });
          setMatchedCards([]);
          setFlippedCards([]);
          setMoveCount(0);
          setMistakeCount(0);
          setTimer(0);
        }}
        settings={settings}
        setSettings={setSettings}
      />
    </ContentAligner>
  );
};

export default MatchingGameMode;
