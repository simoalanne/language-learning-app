import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const SelectTags = ({ tags, selectedTags, setSelectedTags, wordsAvailableForTags }) => {
  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((selectedTag) => selectedTag !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  if (tags.length === 0) return null;

  return (
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {tags.map((tag, i) => (
          <Chip
            key={tag}
            label={tag + ` (${wordsAvailableForTags[i] || 0})`}
            onClick={() => handleTagClick(tag)}
            clickable
            color={selectedTags.includes(tag) ? "primary" : "default"}
            variant={selectedTags.includes(tag) ? "filled" : "outlined"}
          />
        ))}
      </Box>
  );
};

export default SelectTags;