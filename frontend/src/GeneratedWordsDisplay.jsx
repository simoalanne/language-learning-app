import {
  Box, Typography, ToggleButtonGroup, ToggleButton, Tooltip,
  TextField, Button, CircularProgress
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import WordTranslationRow from "./WordTranslationRow";
import WordTranslationCard from "./WordTranslationCard";
import { useState } from "react";

const WordListDisplay = ({
  words,
  form,
  onChangeTranslation,
  onSelect,
  onFormChange,
  onSave,
  loading
}) => {
  const [viewMode, setViewMode] = useState("row");
  const selectedWordsCount = words.filter((word) => word.isSelected).length;

  return (
    <Box sx={{ mt: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={(e, next) => next && setViewMode(next)}
        size="small"
        sx={{ mb: 2 }}
      >
        <Tooltip title="List View" placement="top"><ToggleButton value="row"><ViewListIcon /></ToggleButton></Tooltip>
        <Tooltip title="Card View" placement="top"><ToggleButton value="card"><ViewModuleIcon /></ToggleButton></Tooltip>
      </ToggleButtonGroup>

      <Typography variant="h6">Generated Words:</Typography>
      <Box sx={viewMode === "card" ? {
        display: "flex", flexWrap: "wrap", maxWidth: "1500px", gap: 2, justifyContent: "center"
      } : {}}>
        {words.map((wordItem, i) =>
          viewMode === "row" ? (
            <WordTranslationRow
              key={wordItem.id}
              wordItem={wordItem}
              isSelected={wordItem.isSelected}
              onSelect={onSelect}
              onChangeTranslation={onChangeTranslation}
            />
          ) : (
            <WordTranslationCard
              key={wordItem.id}
              wordItem={wordItem}
              isSelected={wordItem.isSelected}
              onSelect={onSelect}
              onChangeTranslation={onChangeTranslation}
              label={`${i + 1}/${words.length}`}
            />
          )
        )}
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center", alignItems: "center", my: 5 }}>
        <Typography variant="body1" sx={{ mr: 2 }}>
          {selectedWordsCount} out of {words.length} words selected
        </Typography>
        <TextField label="Tag1" placeholder="first describing tag" value={form.topic} onChange={(e) => onFormChange("topic", e.target.value)} size="small" />
        <TextField label="Tag2" placeholder="second desribing tag" value={form.skillLevel} onChange={(e) => onFormChange("skillLevel", e.target.value)} size="small" />
        <Button variant="contained" color="success" onClick={onSave} disabled={loading} endIcon={<AddIcon />}>
          Save Selected Words
        </Button>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
            <Typography variant="body1">Saving words...</Typography>
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default WordListDisplay;
