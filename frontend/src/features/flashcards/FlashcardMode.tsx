import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { Box, Button, Fade, TextField, Typography } from "@mui/material";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { normalizeWordGroup } from "../word-groups/wordGroups";
import ContentAligner from "../../components/ContentAligner";
import MoveIcons from "../../components/MoveIcons";
import Flashcard from "./Flashcard";
import { useApiClient } from "../../providers/api-client";
import { useAppAuth } from "../../providers/use-app-auth";
import type { WordGroup } from "@/types/api";

const FlashcardMode = () => {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0); // Track current index
  const [fadeIn, setFadeIn] = useState(true); // Control fade-in animation
  const { api } = useApiClient();
  const { isAuthenticated, isLoaded } = useAppAuth();
  const publicWordGroupsQuery = api.wordGroups.public.list.useQuery(
    isLoaded && !isAuthenticated ? {} : false,
    {
      select: (data) => data.wordGroups.map(normalizeWordGroup),
    }
  );
  const userWordGroupsQuery = api.wordGroups.users.list.useQuery(
    isLoaded && isAuthenticated ? {} : false,
    {
      select: (data) => data.wordGroups.map(normalizeWordGroup),
    }
  );
  const wordGroupsQuery = isAuthenticated ? userWordGroupsQuery : publicWordGroupsQuery;
  const wordgroups: WordGroup[] = wordGroupsQuery.data ?? [];
  const loading = !isLoaded || wordGroupsQuery.isLoading;
  const resetIndexesRef = useRef<(() => void) | null>(null);
  const [inputIndex, setInputIndex] = useState("");

  const handleIndexChange = (newIndex: number) => {
    setFadeIn(false);
    setTimeout(() => {
      resetIndexesRef.current && resetIndexesRef.current(); // reset card indexes so new card starts from the first translation
      setSelectedIndex(newIndex);
      setFadeIn(true);
    }, 500); // Wait for the fade-out animation to finish before changing the card
  };

  const handleGoToIndex = () => {
    const index = Number.parseInt(inputIndex, 10) - 1;
    if (!isNaN(index) && index >= 0 && index < wordgroups.length) {
      handleIndexChange(index);
    }
  };

  if (loading) return null;
  const maxIndex = wordgroups.length - 1;
  return (
    <ContentAligner>
      {wordgroups.length === 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", bgcolor: "rgba(255, 0, 0, 0.1)", padding: 1, borderRadius: 1, color: "red" }}>
            Not enough translations to practise with flashcards
          </Typography>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#36454F",
              width: "50%",
            }}
            endIcon={<ExitToAppIcon />}
            onClick={() => navigate("/learn")}
          >
            Exit
          </Button>
        </Box>
      )}
      {wordgroups.length > 0 && (
        <>
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
                /^\d*$/.test(e.target.value) && setInputIndex(e.target.value)
              }
            />
            <Button
              variant="contained"
              onClick={handleGoToIndex}
              sx={{ bgcolor: "#36454F" }}
            >
              Go
            </Button>
          </Box>
        </>
      )}
    </ContentAligner>
  );
};

export default FlashcardMode;
