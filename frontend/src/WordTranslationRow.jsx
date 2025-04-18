import React from "react";
import { Box, Checkbox, TextField, InputAdornment, Typography, Tooltip } from "@mui/material";
import LanguageFlag from "./LanguageFlag";

const WordTranslationRow = ({
  wordItem,
  isSelected,
  onSelect,
  onChangeTranslation,
}) => {

  const maxTextLength = 50;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        py: 1.5,
        px: 2,
        mb: 1,
        borderRadius: 2,
        backgroundColor: isSelected ? "#e3f2fd" : "#f9f9f9",
        overflowX: "auto",
        whiteSpace: "nowrap",
        boxShadow: "inset 0 0 0 1px #e0e0e0",
        transition: "background-color 0.2s ease-in-out",
      }}
    >
      <Checkbox
        checked={isSelected}
        onChange={(e) => onSelect(wordItem.id, e.target.checked)}
        sx={{ flexShrink: 0 }}
      />

      {wordItem.translations.map((t) => (
        <Box
          key={t.languageName}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexShrink: 0,
          }}
        >
          <LanguageFlag languageName={t.languageName} />
          <TextField
            value={t.word}
            onChange={(e) => onChangeTranslation(wordItem.id, t.languageName, e.target.value)}
            size="small"
            sx={{ width: "225px" }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={t.word.length >= maxTextLength ? "Maximum length reached" : ""} placement="top">
                      <Typography variant="caption" sx={{ color: t.word.length >= maxTextLength ? "red" : "inherit" }}>
                        {`${t.word.length}/${maxTextLength}`}
                      </Typography>
                    </Tooltip>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      ))}
    </Box>
  );
};

export default WordTranslationRow;
