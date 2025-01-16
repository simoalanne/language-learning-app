import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import "./LearnWords.css";
import ContentAligner from "./ContentAligner";

const LearnWords = () => {
  const navigate = useNavigate();

  const learningModes = [
    {
      id: 1,
      title: "📖 Flashcards",
      name: "flashcards",
      description:
        "The classic way to learn new words. Flip the card to see the translation!",
      gradient: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
    },
    {
      id: 3,
      title: "🔍🃏 Matching Game",
      name: "matching-game",
      description:
        "Find a matching pair of words with the same meaning in this memory game!",
      gradient: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
    },
    {
      id: 4,
      title: "📝 Test",
      name: "test",
      description:
        "Ready to put your knowledge to a real test? Take a vocabulary test to see how well you know the words!",
      gradient: "linear-gradient(45deg, #66BB6A 30%, #43A047 90%)",
    },
  ];

  return (
    <ContentAligner background="url(/style1.png)">
      <Box
        sx={{
          m: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          justifyContent: "center",
        }}
      >
        {learningModes.map((mode) => (
          <Box
            key={mode.id}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              width: "300px",
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "20px",
              textAlign: "center",
              bgcolor: "white",
            }}
          >
            <Typography variant="h6">{mode.title}</Typography>
            <Typography variant="body1">{mode.description}</Typography>
            <Button
              variant="contained"
              sx={{
                width: "50%",
                maxWidth: "250px",
                height: "50px",
                borderRadius: "25px",
                alignSelf: "center",
                background: mode.gradient,
                "&:hover": {
                  scale: 1.05,
                },
              }}
              onClick={() => navigate(`/${mode.name}`)}
            >
              Start
            </Button>
          </Box>
        ))}
      </Box>
    </ContentAligner>
  );
};

export default LearnWords;
