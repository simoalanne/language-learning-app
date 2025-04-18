import useWordgroups from "./hooks/useWordgroups";
import { useState } from "react";
import { filterWordGroupsByLanguagesAndTags } from "./util/helpers";
import TestItem from "./TestItem";
import ContentAligner from "./ContentAligner";
import TestSettings from "./TestSettings";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { Box, Typography, Button } from "@mui/material";
import TestEndScreen from "./TestEndScreen";
import { useNavigate } from "react-router-dom";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

const TestMode = () => {
  const navigate = useNavigate();
  const { wordgroups, loading } = useWordgroups();
  const [testObject, setTestObject] = useState({
    test: {
      questions: [],
      correctAnswers: [],
    },
    settingsOpen: true,
    testStarted: false,
    totalHearts: 3,
    heartsLeft: 3,
    score: 0,
    selectedLanguages: ["English", "Finnish"],
    selectedTags: [],
    totalQuestions: 20,
  });
  const [testIndex, setTestIndex] = useState(0);
  // filter questions based on selected languages and tags
  const availableQuestions = filterWordGroupsByLanguagesAndTags(
    wordgroups,
    testObject.selectedLanguages,
    testObject.selectedTags
  );

  const availableTags = [...new Set(wordgroups.map((wg) => wg.tags).flat())];

  const newWordGroups = [...wordgroups];
  // create a new array for each available tag. then include the wordgroups that have the tag in the array
  // and also have both selected languages
  const wordgroupsByTags = availableTags.map(
    (tag) =>
      newWordGroups.filter(
        (wg) =>
          wg.tags.includes(tag) &&
          testObject.selectedLanguages.every((lang) =>
            wg.translations.map((t) => t.languageName).includes(lang)
          )
      ).length
  );

  const testEnded =
    (testIndex === testObject.totalQuestions && testIndex !== 0) ||
    testObject.heartsLeft === 0;

  const onNextQuestion = (skipped, correct) => {
    if (!skipped && !correct) {
      setTestObject((prev) => ({
        ...prev,
        heartsLeft: prev.heartsLeft - 1,
        testStarted: prev.heartsLeft === 1 ? false : true,
      }));
    }
    if (correct) {
      setTestObject((prev) => ({
        ...prev,
        score: prev.score + 1,
      }));
    }
    setTestIndex((prev) => prev + 1);
  };
  const generateTest = () => {
    // get selected amount of ranzomided word groups
    if (availableQuestions.length < testObject.totalQuestions) {
      // failsafe check to prevent infinite loop
      setTestObject((prev) => ({
        ...prev,
        totalQuestions: availableQuestions.length,
      }));
    }
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
      },
      settingsOpen: false,
      testStarted: true,
    }));
  };

  const Hearts = () => {
    const heartArray = Array(testObject.totalHearts).fill(null);
    return (
      <Box sx={{ display: "flex", gap: 2 }}>
        {heartArray.map((_, index) => (
          <FavoriteIcon
            key={index}
            sx={{
              color: "red",
              opacity: index < testObject.heartsLeft ? 1 : 0.2,
              fontSize: 50,
              animation:
                index === 0 && testObject.heartsLeft === 1
                  ? "pulse 1s infinite"
                  : "none",
              // below code is AI generated
              "@keyframes pulse": {
                "0%": { transform: "scale(1)" },
                "50%": { transform: "scale(1.2)" },
                "100%": { transform: "scale(1)" },
              },
            }}
          />
        ))}
      </Box>
    );
  };

  if (loading) return null;
  return (
    <ContentAligner>
      {testObject.testStarted && testObject.heartsLeft > 0 && !testEnded && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              onClick={() =>
                setTestObject((prev) => ({ ...prev, settingsOpen: true }))
              }
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
              onClick={() => navigate("/learn")}
            >
              Exit
            </Button>
          </Box>
          <Typography variant="h5">
            Question {testIndex + 1} / {testObject.totalQuestions}
          </Typography>
          <Hearts />
          {testObject.test.questions
            .filter((_, index) => index === testIndex)
            .map((question, index) => (
              <TestItem
                key={index}
                question={question}
                correctAnswer={testObject.test.correctAnswers[testIndex]}
                answerLanguage={testObject.selectedLanguages[1]}
                onNextQuestion={(skipped, correct) =>
                  onNextQuestion(skipped, correct)
                }
              />
            ))}
        </Box>
      )}
      <TestSettings
        testObject={testObject}
        setTestObject={setTestObject}
        onTestStart={generateTest}
        availableQuestions={availableQuestions.length}
        onAppExit={() => navigate("/learn")}
        availableTags={availableTags}
        pairsPerTag={wordgroupsByTags}
      />
      {testEnded && (
        <TestEndScreen
          ranOutOfHearts={testObject.heartsLeft === 0}
          score={testObject.score}
          totalQuestions={testObject.totalQuestions}
          onRestart={() => {
            setTestIndex(0);
            setTestObject((prev) => ({
              ...prev,
              testStarted: false,
              score: 0,
              heartsLeft: prev.totalHearts,
              settingsOpen: true,
            }));
          }}
          onQuit={() => navigate("/learn")}
        />
      )}
    </ContentAligner>
  );
};

export default TestMode;
