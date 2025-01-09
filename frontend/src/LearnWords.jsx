import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import "./LearnWords.css";
import QuestionCard from "./QuestionCard";
import LearningModeCard from "./LearningModeCard";
import LearningModeSettings from "./LearningModeSettings";
import FlashcardMode from "./FlashcardMode";
import MatchingGameMode from "./MatchingGameMode";

const LearnWords = ({ wordGroups, languageNames }) => {
  const [currentTab, setCurrentTab] = useState("settings"); // 'settings', 'test', or 'results'
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [selectedLearningMode, setSelectedLearningMode] = useState(1);
  const [test, setTest] = useState({ questions: [], answers: [] });

  const [filterOptions, setFilterOptions] = useState({
    sourceLanguage: "English",
    targetLanguage: "Finnish",
    selectedTags: [],
    randomizeOrder: true,
  });

  const learningModes = [
    {
      id: 1,
      title: "📖 Flashcards",
      name: "Flashcards",
      description:
        "The classic way to learn new words. Flip the card to see the translation!",
    },
    {
      id: 2,
      title: "🎠 Carousel Cards",
      name: "Carousel Cards",
      description: `New innovative way to learn words. Similar to flashcards but each card includes all the translations that are available for the group.
        Click on the card to rotate it and see the next translation. After reaching the end the card will rotate back to the first translation.`,
    },
    {
      id: 3,
      title: "🔍🃏 Matching Game",
      name: "Matching Game",
      description:
        "Find a matching pair of words with the same meaning in this memory game!",
    },
    {
      id: 4,
      title: "📝 Test",
      name: "Test",
      description:
        "Ready to put your knowledge to a real test? Take a vocabulary test to see how well you know the words!",
    },
  ];

  const modeName = learningModes.find(
    (mode) => mode.id === selectedLearningMode
  ).name;

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
  };

  const submitTest = () => {
    // normalize answers and questions to lowercase
    const correctAnswersCount = test.answers
      .map((answer, i) => {
        const userAnswer = userAnswers[i];
        return answer.includes(userAnswer);
      })
      .filter((answer) => answer === true).length; // count correct answers
    setCorrectAnswers(correctAnswersCount);
    setCurrentTab("results");
  };

  const closeResults = ({ restart }) => {
    setUserAnswers([]);
    setCorrectAnswers(0);
    if (restart) {
      setCurrentTab("Test");
      return;
    }
    setCurrentTab("settings");
    setTest({ questions: [], answers: [] });
  };

  const filterByTags = (tags) =>
    wordGroups.filter((group) => {
      return tags.length === 0 || tags.some((tag) => group.tags.includes(tag));
    });

  const generateCarouselCards = ({ selectedTags }) => {
    const filteredGroups = filterByTags(selectedTags);
    return filteredGroups;
  };

  const generateFlashCards = ({
    selectedTags,
    sourceLanguage,
    targetLanguage,
  }) => {
    const filteredGroups = filterByTags(selectedTags);
    return filteredGroups
      .map((group, i) => {
        const sourceWord = group.translations.find(
          (translation) => translation.languageName === sourceLanguage
        )?.word;
        const targetWord = group.translations.find(
          (translation) => translation.languageName === targetLanguage
        )?.word;
        return {
          sourceWord,
          targetWord,
          sourceLanguage,
          targetLanguage,
          id: i + 1,
        };
      })
      .filter((group) => group.sourceWord && group.targetWord);
  };

  const updateTest = ({ sourceLanguage, targetLanguage, selectedTags }) => {
    if (wordGroups.length === 0) return { questions: [], answers: [] };

    const filteredTest = filterByTags(selectedTags);

    if (filteredTest.length === 0) return { questions: [], answers: [] };

    const mappedTest = filteredTest
      .map((group) => {
        // Find the source and target word objects within the translations array
        const sourceWordObj = group.translations.find(
          (item) => item.languageName === sourceLanguage
        );
        const targetWordObj = group.translations.find(
          (item) => item.languageName === targetLanguage
        );

        // If both languages are available in the group, proceed
        if (sourceWordObj && targetWordObj) {
          const question = sourceWordObj.word;
          const answer = targetWordObj.word;
          const synonyms = [...targetWordObj.synonyms, answer];

          return { question, answers: synonyms };
        }

        return null;
      })
      .filter((testItem) => testItem !== null); // Remove any null values if a group didn't have both languages

    return {
      questions: mappedTest.map((testItem) => testItem.question),
      answers: mappedTest.map((testItem) => testItem.answers),
    };
  };

  const availableQuestions = updateTest(filterOptions);
  /**
   * Generates the test based on the filter options
   * If the randomizeOrder option is enabled, the questions will be shuffled
   * using the Fisher-Yates algorithm
   * @param {Object} test - the test state object
   * @returns {Object} - the updated test object
   */
  const generateTest = (test) => {
    test = updateTest(filterOptions);
    if (!filterOptions.randomizeOrder) return test;
    let array = test.questions.map((question, i) => {
      return {
        question: question,
        answers: test.answers[i],
      };
    });

    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    const newQuestions = array.map((item) => item.question);
    const newAnswers = array.map((item) => item.answers);
    return { questions: newQuestions, answers: newAnswers };
  };

  return (
    <>
      {currentTab === "settings" && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 5,
              justifyContent: "center",
              mt: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                width: "90%",
                maxWidth: "500px",
              }}
            >
              {learningModes.map((mode) => (
                <LearningModeCard
                  key={mode.id}
                  learningModeObj={mode}
                  selectedLearningMode={selectedLearningMode}
                  setSelectedLearningMode={setSelectedLearningMode}
                />
              ))}
            </Box>
            <LearningModeSettings
              modeName={modeName}
              wordGroups={wordGroups}
              languageNames={languageNames}
              setCurrentTab={setCurrentTab}
              totalQuestions={test.questions.length}
              filterOptions={filterOptions}
              setFilterOptions={setFilterOptions}
              availableQuestions={availableQuestions.questions.length}
            />
          </Box>
          <Button
            variant="contained"
            color="secondary"
            disabled={availableQuestions.questions.length === 0}
            sx={{
              width: "50%",
              maxWidth: "250px",
              height: "50px",
              borderRadius: "25px",
              "&:hover": {
                scale: 1.05,
              },
            }}
            onClick={() => {
              if (modeName === "Test" || modeName === "Matching Game") {
                setTest(generateTest(test));
              }
              setCurrentTab(modeName);
            }}
          >
            Start {modeName}
          </Button>
        </Box>
      )}
      {currentTab === "Test" && (
        <Box sx={{ width: "90%", maxWidth: "500px", margin: "auto" }}>
          <Typography variant="h5">Test</Typography>
          {test.questions.map((question, i) => (
            <QuestionCard
              key={i}
              question={question}
              index={i}
              totalQuestions={test.questions.length}
              handleAnswerChange={handleAnswerChange}
            />
          ))}
          <Button
            sx={{ marginTop: 2 }}
            onClick={() => setCurrentTab("settings")}
            fullWidth
          >
            Quit test
          </Button>
          <Button
            sx={{ marginTop: 1 }}
            onClick={submitTest}
            disabled={userAnswers.length !== test.questions.length}
            fullWidth
          >
            Submit
          </Button>
        </Box>
      )}
      {currentTab === "Flashcards" && (
        <FlashcardMode
          wordGroups={generateFlashCards(filterOptions)}
          modeName={modeName}
          onExit={() => setCurrentTab("settings")}
        />
      )}
      {currentTab === "Carousel Cards" && (
        <FlashcardMode
          wordGroups={generateCarouselCards(filterOptions)}
          modeName={modeName}
          onExit={() => setCurrentTab("settings")}
        />
      )}
      {currentTab === "Matching Game" && (
        <MatchingGameMode
          questions={test.questions || []}
          answers={test.answers || []}
          onExit={() => setCurrentTab("settings")}
          sourceLanguage={filterOptions.sourceLanguage}
          targetLanguage={filterOptions.targetLanguage}
        />
      )}
      {currentTab === "results" && (
        <Box sx={{ width: "90%", maxWidth: "500px", margin: "auto" }}>
          <Typography variant="h5">Results</Typography>
          <Typography variant="body1">{`You got ${correctAnswers} out of ${test.questions.length} correct`}</Typography>
          {correctAnswers !== test.questions.length && (
            <Button
              variant="contained"
              sx={{ marginTop: 2 }}
              onClick={() => closeResults({ restart: true })}
              fullWidth
            >
              Try again?
            </Button>
          )}
          <Button
            variant="contained"
            sx={{ marginTop: 1 }}
            onClick={() => closeResults({ restart: false })}
            fullWidth
          >
            Close
          </Button>
        </Box>
      )}
    </>
  );
};

export default LearnWords;
