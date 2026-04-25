import { TextField, Typography, Button, Box } from "@mui/material";
import { useState } from "react";
import {
  Check as CorrectAnswerIcon,
  Close as WrongAnswerIcon,
} from "@mui/icons-material";

const TestItem = ({
  question,
  correctAnswer,
  onNextQuestion,
  answerLanguage,
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const normalize = (str) => (str ? str.toLowerCase().trim() : "");
  const handleSubmit = () => {
    setIsCorrect(
      correctAnswer.some((ans) => normalize(ans) === normalize(userAnswer))
    );
    setAnswerSubmitted(true);
  };

  const handleSkip = () => {
    setUserAnswer("");
    setIsCorrect(false);
    setAnswerSubmitted(false);
    onNextQuestion(true);
  };

  const positiveMessages = [
    "Awesome!",
    "Great job!",
    "Well done!",
    "Keep it up!",
    "Good work!",
  ];

  const negativeMessages = [
    "Oops!",
    "Wrong",
    "Try again!",
    "Incorrect",
    "That's not right",
  ];

  return (
    <>
      <Box
        sx={{
          width: "100%",
          maxWidth: "600px",
          padding: 2,
          gap: 3,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          {`What's "${question}" in ${answerLanguage}?`}
        </Typography>
        <TextField
          autoComplete="off"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          label="Your Answer"
          fullWidth
          variant="outlined"
        />
      </Box>
      {!answerSubmitted && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            bgcolor: "rgba(0, 0, 0, 0.1)",
            py: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "space-around", sm: "space-around" },
          }}
        >
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!userAnswer}
            sx={{
              borderRadius: 10,
              fontSize: { xs: "0.75rem", sm: "1.25rem" },
              px: 5,
              py: 1,
              bgcolor: "green",
              transition: "transform 0.3s",
              "&:hover": {
                backgroundColor: "darkgreen",
                transform: "scale(1.1)",
              },
            }}
          >
            Check
          </Button>
          <Button
            variant="contained"
            onClick={handleSkip}
            sx={{
              borderRadius: 10,
              fontSize: { xs: "0.75rem", sm: "1.25rem" },
              px: 5,
              py: 1,
              transition: "transform 0.3s",
              bgcolor: "#36454F",
              "&:hover": {
                bgcolor: "#1C313A",
                transform: "scale(1.1)",
              },
            }}
          >
            {"Don't know"}
          </Button>
        </Box>
      )}
      {answerSubmitted && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            bgcolor: isCorrect
              ? "rgba(0, 255, 0, 0.2)"
              : "rgba(255, 0, 0, 0.2)",
            padding: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: "50px",
                height: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                backgroundColor: "white",
              }}
            >
              {isCorrect ? (
                <CorrectAnswerIcon
                  sx={{
                    color: "green",
                    fontSize: "36px",
                    fontWeight: "bold", // Adds thickness to the icon
                  }}
                />
              ) : (
                <WrongAnswerIcon
                  sx={{
                    color: "red",
                    fontSize: "36px",
                    fontWeight: "bold", // Adds thickness to the icon
                  }}
                />
              )}
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: isCorrect ? "green" : "red",
                }}
              >
                {isCorrect
                  ? positiveMessages[
                      Math.floor(Math.random() * positiveMessages.length)
                    ]
                  : `${
                      negativeMessages[
                        Math.floor(Math.random() * negativeMessages.length)
                      ]
                    }`}
              </Typography>
              {!isCorrect && (
                <Typography
                  sx={{ color: "red", fontSize: { xs: "0.75rem", sm: "1rem" } }}
                >
                  {`Correct Answer: ${correctAnswer[0]}`}
                </Typography>
              )}
            </Box>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setUserAnswer("");
              setIsCorrect(false);
              setAnswerSubmitted(false);
              onNextQuestion(false, isCorrect);
            }}
            sx={{
              backgroundColor: isCorrect ? "green" : "red",
              borderRadius: 10,
              fontSize: { xs: "1rem", sm: "1.25rem" },
              px: 3,
              py: 1,
              transition: "transform 0.3s",
              "&:hover": {
                backgroundColor: isCorrect ? "darkgreen" : "darkred",
                transform: "scale(1.1)",
              },
            }}
          >
            Continue
          </Button>
        </Box>
      )}
    </>
  );
};

export default TestItem;
