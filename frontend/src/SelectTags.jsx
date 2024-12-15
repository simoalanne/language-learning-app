/* eslint react/prop-types: 0 */
// code partially copied from mui.com documentation.
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";

const SelectTags = ({ tags, selectedTags, setSelectedTags }) => {
  console.log("tags", tags);
  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedTags(typeof value === "string" ? value.split(",") : value); 
  };
  if (tags.length === 0) return;

  return (
    <FormControl sx={{ marginTop: "10px", width: "200px" }}>
      <InputLabel id="select-multiple-checkbox-label">Tags</InputLabel>
      <Select
        labelId="select-multiple-checkbox-label"
        id="select-multiple-checkbox"
        multiple
        value={selectedTags}
        onChange={handleChange}
        input={<OutlinedInput label="Tags" />}
        renderValue={(selected) => selected.join(", ")}
      >
        {tags.map((tag) => (
          <MenuItem key={tag} value={tag}>
            <Checkbox checked={selectedTags.includes(tag)} />
            <ListItemText primary={tag} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectTags;
