/* eslint react/prop-types: 0 */
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";

const SelectDifficulty = ({ difficulties, difficulty, setDifficulty }) => {
  console.log("diff", difficulties);
  console.log("one", difficulty);
  if (difficulties.length === 0) return null;

  return (
    <FormControl sx={{ marginTop: "10px", width: "200px" }}>
      <InputLabel id="difficulty-select-label">Difficulty</InputLabel>
      <Select
        labelId="difficulty-select-label"
        id="difficulty-select"
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value || "")} 
      >
        <MenuItem value="">None</MenuItem>
        {difficulties.map((difficulty) => (
          <MenuItem key={difficulty} value={difficulty}>
            {difficulty}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectDifficulty;