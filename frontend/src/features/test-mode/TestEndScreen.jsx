import {Typography, Box, Button } from "@mui/material";
const TestEndScreen = ({ score, totalQuestions, onRestart, onQuit, ranOutOfHearts }) => {

  const GradeRenderer = () => {
    const percentage = `${Math.round((score / totalQuestions) * 100)}%`;
    if (score === totalQuestions) {
      return `Grade: A+ (${percentage})`;
    } else if (score >= totalQuestions * 0.9) {
      return `Grade: A (${percentage})`;
    } else if (score >= totalQuestions * 0.8) {
      return `Grade: B (${percentage})`;
    } else if (score >= totalQuestions * 0.7) {
      return `Grade: C (${percentage})`;
    } else if (score >= totalQuestions * 0.6) {
      return `Grade: D (${percentage})`;
    } else {
      return `Grade: F (${percentage})`;
    }
  }
  return (
    <Box sx={{width: "90%", maxWidth: "600px", gap: 3, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Typography variant="h4">
        {ranOutOfHearts ? "You failed the test!" : "Test completed!"}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: "bold", p: 2, borderRadius: "5px", bgcolor: "rgba(0, 0, 0, 0.1)" }}>
        <GradeRenderer />
      </Typography>
      <Button variant="contained" onClick={onRestart} sx={{ bgcolor: "green" }}>
        Restart
      </Button>
      <Button variant="contained" onClick={onQuit} sx={{ bgcolor: "#36454F" }}>
        Back to mode selection
      </Button>
    </Box>

  );
}

export default TestEndScreen;