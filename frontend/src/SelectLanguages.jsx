/* eslint react/prop-types: 0 */
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import SwapLanguages from "./SwapLanguages";

const SelectLanguages = ({
  languageNames,
  selectedLanguages,
  setSelectedLanguages,
}) => {
  console.log("available languages", languageNames);
  console.log("selected languages", selectedLanguages);
  const DropDownMenu = ({ index }) => {
    return (
      <FormControl sx={{ marginTop: "10px", width: "200px" }}>
        <InputLabel id={`language-select-label-${index}`}>
          {index === 0 ? "Question language" : "Answer language"}
        </InputLabel>
        <Select
          labelId={`language-select-label-${index}`}
          id="language-select"
          name="language-select"
          label={index === 0 ? "Question language" : "Answer language"}
          value={selectedLanguages[index]}
          onChange={(e) =>
            setSelectedLanguages((prevLanguages) => {
              const newLanguages = [...prevLanguages];
              newLanguages[index] = e.target.value;
              return newLanguages;
            })
          }
        >
          {languageNames
            .filter(
              (lang) => !selectedLanguages[index === 0 ? 1 : 0].includes(lang)
            )
            .map((language) => (
              <MenuItem key={language} value={language}>
                {language}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    );
  };
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <DropDownMenu index={0} />
      <DropDownMenu index={1} />
      <SwapLanguages
        selectedLanguages={selectedLanguages}
        setSelectedLanguages={setSelectedLanguages}
      />
    </div>
  );
};

export default SelectLanguages;
