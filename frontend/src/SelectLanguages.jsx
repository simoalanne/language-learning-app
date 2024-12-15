/* eslint react/prop-types: 0 */
import { Select, MenuItem, FormControl, InputLabel, Button } from "@mui/material";
import languageList from "./util/languageList";
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const SelectLanguages = ({ languages, setLanguages }) => {
  const dropDownMenu = (index) => {
    return (
      <FormControl sx={{ marginTop: "10px", width: "200px" }}>
        <InputLabel id={`language-select-label-${index}`}>
          {index === 0 ? "Question language" : "Answer language"}
        </InputLabel>
        <Select
          labelId={`language-select-label-${index}`}
          id={`language-select-${index}`}
          value={languages[index]}
          onChange={(e) =>
            setLanguages((prevLanguages) => {
              const newLanguages = [...prevLanguages];
              newLanguages[index] = e.target.value;
              return newLanguages;
            })
          }
        >
          {languageList
            .filter((lang) => lang.name !== languages[index === 0 ? 1 : 0]) // dont let user select same language for both
            .map((language) => (
              <MenuItem key={language.name} value={language.name}>
                {language.name}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    );
  };
  console.log(languages);
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {dropDownMenu(0)}
      {dropDownMenu(1)}
      <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: "10px" }}
        startIcon={<SwapHorizIcon />}
        onClick={() => setLanguages([languages[1], languages[0]])}
      >
        Swap languages
      </Button>
    </div>
  );
};

export default SelectLanguages;
