import useWordgroups from "./hooks/useWordgroups";
import { useState } from "react";
import { filterWordGroupsByLanguagesAndTags } from "./util/helpers";
import { Button, Box, Paper } from "@mui/material";
import TestCard from "./TestCard";
import ContentAligner from "./ContentAligner";

const TestMode = () => {
  const { wordgroups, loading } = useWordgroups();
  const [userAnswers, setUserAnswers] = useState([]);
  const [testObject, setTestObject] = useState({
    test: {
      questions: [],
      correctAnswers: [],
    },
    settingsOpen: true,
    testStarted: false,
    testSubmitted: false,
    selectedLanguages: ["English", "Finnish"],
    selectedTags: [],
    totalQuestions: 20,
  });

  // filter questions based on selected languages and tags
  const availableQuestions = filterWordGroupsByLanguagesAndTags(
    wordgroups,
    testObject.selectedLanguages,
    testObject.selectedTags
  );

  const generateTest = () => {
    // get selected amount of ranzomided word groups
    let randomWordGroups = new Set();
    while (randomWordGroups.size < testObject.totalQuestions) {
      randomWordGroups.add(
        availableQuestions[
          Math.floor(Math.random() * availableQuestions.length)
        ]
      );
    }
    randomWordGroups = [...randomWordGroups];
    const questions = randomWordGroups.map((wg) => {
      const translation = wg.translations.find(
        (t) => t.languageName === testObject.selectedLanguages[0]
      );
      return translation.word;
    });

    const correctAnswers = randomWordGroups.map((wg) => {
      const translation = wg.translations.find(
        (t) => t.languageName === testObject.selectedLanguages[1]
      );
      return [translation.word, ...translation.synonyms];
    });
    setTestObject((prev) => ({
      ...prev,
      test: {
        questions,
        correctAnswers,
        testStarted: true,
      },
    }));
    setUserAnswers(new Array(testObject.totalQuestions).fill(""));
  };

  if (loading) return null;
  return (
    <>
      <ContentAligner sx={{ m: 2, minHeight: "cakc(100vh - 80px)" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
          <Button onClick={generateTest}>Generate test</Button>
          {testObject.test.questions.map((question, index) => (
            <TestCard
              key={index}
              question={question}
              correctAnswer={testObject.test.correctAnswers[index]}
              userAnswer={userAnswers[index]}
              setUserAnswers={(newAns) =>
                setUserAnswers((prev) => {
                  const newAnswers = [...prev];
                  newAnswers[index] = newAns;
                  return newAnswers;
                })
              }
            />
          ))}
          <Paper sx={{ p: 2 }}>
            <Button
              variant="contained"
              onClick={() =>
                setTestObject((prev) => ({ ...prev, testSubmitted: true }))
              }
            >
              Submit test
            </Button>
          </Paper>
        </Box>
      </ContentAligner>
    </>
  );
};

export default TestMode;
