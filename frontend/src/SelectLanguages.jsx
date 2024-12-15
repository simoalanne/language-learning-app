/* eslint react/prop-types: 0 */
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import languageList from "./util/languageList";

const SelectLanguages = ({ languages, setLanguages }) => {
  const dropDownMenu = (index) => {
    return (
      <FormControl sx={{marginTop: "10px", width: "200px"}}>
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

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {dropDownMenu(0)}
      {dropDownMenu(1)}
    </div>
  );
};

export default SelectLanguages;
