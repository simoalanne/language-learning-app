import { Card, CardHeader, CardContent, Typography, Box } from "@mui/material";
import SelectTags from "./SelectTags";
import SelectLanguagePair from "./SelectLanguagePair";
import SwapLanguagePair from "./SwapLanguagePair";
import ToggleOption from "./ToggleOption";

const LearningModeSettings = ({
  modeName,
  languageNames,
  wordGroups,
  availableQuestions,
  filterOptions,
  setFilterOptions,
}) => {
  const allTags = [
    ...new Set(
      wordGroups
        .map((wordGroup) => wordGroup.tags)
        .flat()
        .sort()
    ),
  ];
  return (
    <Card sx={{ width: 300 }}>
      <CardHeader title={`${modeName} settings`} />
      {modeName === "Test" && (
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <SelectLanguagePair
              languageNames={languageNames}
              selectedLanguages={[
                filterOptions.sourceLanguage,
                filterOptions.targetLanguage,
              ]}
              setSelectedLanguages={(languages) =>
                setFilterOptions({
                  ...filterOptions,
                  sourceLanguage: languages[0],
                  targetLanguage: languages[1],
                })
              }
            />
            <SwapLanguagePair
              selectedLanguages={[
                filterOptions.sourceLanguage,
                filterOptions.targetLanguage,
              ]}
              setSelectedLanguages={(languages) =>
                setFilterOptions({
                  ...filterOptions,
                  sourceLanguage: languages[0],
                  targetLanguage: languages[1],
                })
              }
            />
            <SelectTags
              header={"Filter translations by tags"}
              tags={allTags}
              selectedTags={filterOptions.selectedTags}
              setSelectedTags={(tags) =>
                setFilterOptions({ ...filterOptions, selectedTags: tags })
              }
            />
            <ToggleOption
              value={filterOptions.randomizeOrder}
              setValue={(value) =>
                setFilterOptions({ ...filterOptions, randomizeOrder: value })
              }
              label="Randomize question order"
            />
          </Box>
        </CardContent>
      )}
      {modeName === "Flashcards" && (
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <SelectLanguagePair
              languageNames={languageNames}
              selectedLanguages={[
                filterOptions.sourceLanguage,
                filterOptions.targetLanguage,
              ]}
              setSelectedLanguages={(languages) =>
                setFilterOptions({
                  ...filterOptions,
                  sourceLanguage: languages[0],
                  targetLanguage: languages[1],
                })
              }
            />
            <SwapLanguagePair
              selectedLanguages={[
                filterOptions.sourceLanguage,
                filterOptions.targetLanguage,
              ]}
              setSelectedLanguages={(languages) =>
                setFilterOptions({
                  ...filterOptions,
                  sourceLanguage: languages[0],
                  targetLanguage: languages[1],
                })
              }
            />
            <SelectTags
              header={"Learn flashcards that have these tags"}
              tags={allTags}
              selectedTags={filterOptions.selectedTags}
              setSelectedTags={(tags) =>
                setFilterOptions({ ...filterOptions, selectedTags: tags })
              }
            />
            <Typography variant="h6">{`Number of flashcards: ${availableQuestions}`}</Typography>
          </Box>
        </CardContent>
      )}
      {modeName === "Matching Game" && (
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <SelectLanguagePair
              languageNames={languageNames}
              selectedLanguages={[
                filterOptions.sourceLanguage,
                filterOptions.targetLanguage,
              ]}
              setSelectedLanguages={(languages) =>
                setFilterOptions({
                  ...filterOptions,
                  sourceLanguage: languages[0],
                  targetLanguage: languages[1],
                })
              }
            />
            <SwapLanguagePair
              selectedLanguages={[
                filterOptions.sourceLanguage,
                filterOptions.targetLanguage,
              ]}
              setSelectedLanguages={(languages) =>
                setFilterOptions({
                  ...filterOptions,
                  sourceLanguage: languages[0],
                  targetLanguage: languages[1],
                })
              }
            />
            <SelectTags
              header={"Filter pairs by tags"}
              tags={allTags}
              selectedTags={filterOptions.selectedTags}
              setSelectedTags={(tags) =>
                setFilterOptions({ ...filterOptions, selectedTags: tags })
              }
            />
            <Typography variant="h6">{`Number of matching pairs: ${availableQuestions}`}</Typography>
          </Box>
        </CardContent>
      )}
      {modeName === "Carousel Cards" && (
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <SelectTags
              header={"Filter cards by tags"}
              tags={allTags}
              selectedTags={filterOptions.selectedTags}
              setSelectedTags={(tags) =>
                setFilterOptions({ ...filterOptions, selectedTags: tags })
              }
            />
            <Typography variant="h6">{`Number of cards: ${availableQuestions}`}</Typography>
          </Box>
        </CardContent>
      )}
    </Card>
  );
};

export default LearningModeSettings;
