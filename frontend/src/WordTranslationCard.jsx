import React from "react";
import { Box, Checkbox, TextField, InputAdornment, Typography, Tooltip, Card, CardContent } from "@mui/material";
import LanguageFlag from "./LanguageFlag";

const WordTranslationCard = ({
  wordItem,
  isSelected,
  onSelect,
  onChangeTranslation,
  label,
}) => {
  const maxTextLength = 50;

  return (
    <Card
      sx={{
        position: "relative",
        borderRadius: 2,
        p: 3,
        backgroundColor: isSelected ? "#e3f2fd" : "#f9f9f9",
        transition: "background-color 0.2s ease-in-out",
      }}
    >
      <Typography variant="body2" sx={{
        top: 8,
        left: 8,
        position: "absolute",
        fontWeight: "bold",
      }}>
        {label}
      </Typography>
      <Checkbox
        checked={isSelected}
        onChange={(e) => onSelect(wordItem.id, e.target.checked)}
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
      />
      <CardContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {wordItem.translations.map((t) => (
            <Box
              key={t.languageName}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <LanguageFlag languageName={t.languageName} />
              <TextField
                value={t.word}
                onChange={(e) => onChangeTranslation(wordItem.id, t.languageName, e.target.value)}
                size="small"
                sx={{width: "300px"}}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip
                          title={t.word.length >= maxTextLength ? "Maximum length reached" : ""}
                          placement="top"
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: t.word.length >= maxTextLength ? "red" : "inherit" }}
                          >
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
      </CardContent>
    </Card>
  );
};

export default WordTranslationCard;