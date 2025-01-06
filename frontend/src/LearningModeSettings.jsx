import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Typography,
  Box,
} from "@mui/material";
import SelectTags from "./SelectTags";
import SelectLanguagePair from "./SelectLanguagePair";
import SwapLanguagePair from "./SwapLanguagePair";
import { useState } from "react";

const LearningModeSettings = ({
  modeName,
  languageNames,
  wordGroups,
  setCurrentTab,
  totalQuestions,
  filterOptions,
  setFilterOptions,
}) => {
  return (
    <Card sx={{ width: 300 }}>
      <CardHeader title={`${modeName} settings`} />
      {modeName === "Test" && (
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2  }}>
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
            tags={wordGroups.flatMap((group) => group.tags)}
            selectedTags={filterOptions.selectedTags}
            setSelectedTags={(tags) =>
              setFilterOptions({ ...filterOptions, selectedTags: tags })
            }
          />
          </Box>
        </CardContent>
      )}
      {modeName !== "Test" && (
        <CardContent sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            sx={{
              color: "primary.main",
              fontWeight: "bold",
            }}
          >
            Coming soon!
          </Typography>
        </CardContent>
      )}
    </Card>
  );
};

export default LearningModeSettings;
