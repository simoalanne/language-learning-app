/* eslint react/prop-types: 0 */
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

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
          id={`language-select-${index}`}
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
      <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: "10px", width: "200px" }}
        startIcon={<SwapHorizIcon />}
        onClick={() => setSelectedLanguages(selectedLanguages.reverse())}
      >
        Swap languages
      </Button>
    </div>
  );
};

export default SelectLanguages;
