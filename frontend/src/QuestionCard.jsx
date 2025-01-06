/* eslint react/prop-types: 0 */
import {TextField } from "@mui/material/";
import "./QuestionCard.css";
const QuestionCard = ({ question, index, totalQuestions, handleAnswerChange }) => {
  return (
    <div className="questionCard">
      <p>{`${index + 1 }/${totalQuestions}`}</p>
      <p>{question}</p>
      <p>Answer:</p>
      <TextField
        autoComplete="off"
        variant="outlined"
        size="small"
        placeholder="Type your answer"
        onChange={(e) => handleAnswerChange(index, e.target.value)}
      />
    </div>
  );
}

export default QuestionCard;