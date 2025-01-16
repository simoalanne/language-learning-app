import {
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";

const TestCard = ({ question, correctAnswer, userAnswer, setUserAnswers}) =>{
  console.log(question, correctAnswer);

  return (
    <Card sx={{ width: 500 }}>
      <CardContent>
        <Typography variant="h5">
          {question}
        </Typography>
        <TextField
          autoComplete="off"
          value={userAnswer}
          onChange={(e) => setUserAnswers(e.target.value)}
          label="Answer"
          fullWidth
        />
      </CardContent>
    </Card>
  );
};

export default TestCard;
