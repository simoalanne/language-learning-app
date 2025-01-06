import  { useState } from "react";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Collapse from "@mui/material/Collapse"; // Import Collapse

const SelectTags = ({ tags, selectedTags, setSelectedTags, header }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((selectedTag) => selectedTag !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  if (tags.length === 0) {
    return <Typography>No tags available</Typography>;
  }

  return (
    <Box sx={{ my: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" gutterBottom>
          {header || "Select tags"}
        </Typography>
        <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </IconButton>
      </Box>
      <Collapse in={!isCollapsed} timeout={200}>
        <Paper
          elevation={3}
          sx={{
            padding: 2,
            border: "1px solid #ccc",
            borderRadius: "8px",
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          {tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onClick={() => handleTagClick(tag)}
              clickable
              color={selectedTags.includes(tag) ? "primary" : "default"}
              variant={selectedTags.includes(tag) ? "filled" : "outlined"}
            />
          ))}
        </Paper>
      </Collapse>
    </Box>
  );
};

export default SelectTags;
