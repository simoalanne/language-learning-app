/* eslint react/prop-types: 0 */
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useState } from "react";
import "./LearnWords.css";

const LearnWords = ({ wordGroups }) => {
  const [testOpen, setTestOpen] = useState(false);
  const [test, setTest] = useState({ questions: [], answers: [] });
  const [resultsOpen, setResultsOpen] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
  };

  const SubmitTest = () => {
    const correctAnswers = test.answers.map((answer, i) => {
      const userAnswer = userAnswers[i];
      return answer.includes(userAnswer);
    }).filter((answer) => answer === true).length; // count correct answers
    setCorrectAnswers(correctAnswers);
    setTestOpen(false);
    setResultsOpen(true);

  };

  const closeResults = () => {
    setResultsOpen(false);
    setUserAnswers([]);
    setCorrectAnswers(0);
  };
  
  const initTest = () => {
    // use flatMap because of nested maps returning array inside array otherwise
    const questions = wordGroups.flatMap((group) => {
      const filteredTranslations = group.translations.filter(
        (translation) => translation.languageName === "English"
      );
      return filteredTranslations.map((translation) => translation.word);
    });

    const answers = wordGroups.flatMap((group) => {
      const filteredTranslations = group.translations.filter(
        (translation) => translation.languageName === "Finnish"
      );
      return filteredTranslations.map((translation) => {
        const word = translation.word;
        const synonyms = translation.synonyms;
        return [word, ...synonyms];
      });
    });

    setTest({ questions, answers });
    setTestOpen(true);
  };

  return (
    <div>
      <Button variant="contained" onClick={() => initTest()}>
        Start a test
      </Button>
      <Dialog open={testOpen} onClose={() => setTestOpen(false)}>
        <DialogTitle>Test</DialogTitle>
        <DialogContent>
          <h3>Questions</h3>
          {test.questions.map((question, i) => (
            <div key={i} className="testQuestion">
              <p>{`${i + 1}. ${question}`}</p>
              <TextField 
                variant="outlined"
                size="small"
                value={userAnswers[i] || ""}
                placeholder="Answer"
                onChange={(e) => handleAnswerChange(i, e.target.value)}
              />

            </div>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestOpen(false)}>Quit test</Button>
          <Button onClick={() => SubmitTest()}>Submit</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={resultsOpen} onClose={() => closeResults()}>
        <DialogTitle>Results</DialogTitle>
        <DialogContent>
          <h3>Results</h3>
          <p>{`You got ${correctAnswers} out of ${test.questions.length} correct`}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeResults()}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LearnWords;
