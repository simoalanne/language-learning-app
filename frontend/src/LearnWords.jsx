/* eslint react/prop-types: 0 */
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import "./LearnWords.css";
import "./QuestionCard";
import QuestionCard from "./QuestionCard";
import SelectLanguages from "./SelectLanguages";
import SelectDifficulty from "./SelectDifficulty";
import SelectTags from "./SelectTags";

const LearnWords = ({ wordGroups }) => {
  const [testOpen, setTestOpen] = useState(false);
  const [test, setTest] = useState({ questions: [], answers: [] });
  const [resultsOpen, setResultsOpen] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState([
    "English",
    "Finnish",
  ]);
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
  };

  const SubmitTest = () => {
    const correctAnswers = test.answers
      .map((answer, i) => {
        const userAnswer = userAnswers[i];
        return answer.includes(userAnswer);
      })
      .filter((answer) => answer === true).length; // count correct answers
    setCorrectAnswers(correctAnswers);
    setTestOpen(false);
    setResultsOpen(true);
  };

  const closeResults = (restart = false) => {
    setResultsOpen(false);
    setUserAnswers([]);
    setTimeout(() => setCorrectAnswers(0), 250);
    if (restart) {
      setTestOpen(true);
    }
  };

  const resetSettings = () => {
    setSelectedLanguages(["English", "Finnish"]);
    setSelectedDifficulty("");
    setSelectedTags([]);
  };

  const canReset =
    selectedLanguages[0] !== "English" ||
    selectedLanguages[1] !== "Finnish" ||
    selectedDifficulty !== "" ||
    selectedTags.length > 0;

  const testCanBeStarted = test.questions.length > 0;

  useEffect(() => {
    console.log("useEffect called");
    const tagsFilteredGroups = wordGroups.filter(
      (group) =>
        selectedTags.length === 0 ||
        selectedTags.every((tag) => group.tags.includes(tag))
    );

    const wordGroupsFilteredByDifficulty = tagsFilteredGroups.filter(
      (group) => selectedDifficulty === group.difficulty || !selectedDifficulty
    );

    const questionsAndAnswers = wordGroupsFilteredByDifficulty
      .map((group) => {
        const filteredTranslations = group.translations.filter(
          (t) =>
            t.languageName === selectedLanguages[0] ||
            t.languageName === selectedLanguages[1]
        );
        return filteredTranslations;
      })
      .filter((group) => group.length === 2); // only include groups where both languages are present

    console.log("questionsAndAnswers", questionsAndAnswers);
    const testObj = questionsAndAnswers.map((group) => {
      const question = group.find(
        (group) => group.languageName === selectedLanguages[0]
      ).word;
      const answer = group.find(
        (group) => group.languageName === selectedLanguages[1]
      ).word;
      const synonyms = group.find(
        (group) => group.languageName === selectedLanguages[1]
      ).synonyms;
      synonyms.push(answer);
      return { question, answers: synonyms };
    });
    setTest({
      questions: testObj.map((t) => t.question),
      answers: testObj.map((t) => t.answers),
    });
  }, [wordGroups, selectedLanguages, selectedDifficulty, selectedTags]);

  const difficulties = wordGroups.map((group) => group.difficulty);
  const uniqueDifficulties = [...new Set(difficulties)].filter(difficulty => difficulty !== "");

  console.log("test", test);
  return (
    <div>
      <Dialog open={testOpen} onClose={() => setTestOpen(false)}>
        <DialogTitle>Test</DialogTitle>
        <DialogContent>
          {test.questions.map((question, i) => (
            <QuestionCard
              key={i}
              question={question}
              index={i}
              totalQuestions={test.questions.length}
              handleAnswerChange={handleAnswerChange}
            />
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
          <p>{`You got ${correctAnswers} out of ${test.questions.length} correct`}</p>
        </DialogContent>
        <DialogActions>
          {correctAnswers !== test.questions.length && (
            <Button onClick={() => closeResults(true)}>Try again?</Button>
          )}
          <Button onClick={() => closeResults()}>Close</Button>
        </DialogActions>
      </Dialog>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => setSettingsOpen(true)}
      >
        Practise words
      </Button>
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <DialogTitle>Test options</DialogTitle>
        <DialogContent>
          <div style={{ display: "flex", flexDirection: "column" }}>
          <SelectLanguages
            languages={selectedLanguages}
            setLanguages={setSelectedLanguages}
          />
          <SelectDifficulty
            difficulties={uniqueDifficulties}
            setDifficulty={setSelectedDifficulty}
            difficulty={selectedDifficulty}
          />
          <SelectTags
            tags={wordGroups.flatMap((group) => group.tags)}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
          />
          </div>
          <p>{`Questions available: ${test.questions.length}`}</p>
        </DialogContent>
        <DialogActions>
          <Button sx={{ color: "red" }} disabled={!canReset} onClick={() => resetSettings()}>
            Reset
          </Button>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
          <Button
            disabled={!testCanBeStarted}
            onClick={() => {
              setSettingsOpen(false);
              setTestOpen(true);
            }}
          >
            Start test
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LearnWords;
