import { Box, Typography, Checkbox } from "@mui/material";

const WordGroupItem = ({ wordGroup, selected }) => {
  const isSelected = selected.includes(wordGroup);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Checkbox
        checked={isSelected}
        sx={{pointerEvents: "none"}} // this is used just as a visual indicator as its in a menu item already
      />
      <Box sx={{ display: "flex", gap: 1 }}>
        {wordGroup.translations.map((translation, i) => (
          <Typography key={i} variant="body1">
            {translation?.word}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

export default WordGroupItem;