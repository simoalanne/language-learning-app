import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";;

const SelectLanguagePair= ({
  languageNames,
  selectedLanguages,
  setSelectedLanguages,
}) => {
  console.log(languageNames);
  console.log(selectedLanguages);
  if (languageNames.length === 0) return;
  const DropDownMenu = ({ index }) => {
    return (
      <FormControl fullWidth>
        <InputLabel id={`language-select-label-${index}`}>
          {index === 0 ? "Question language" : "Answer language"}
        </InputLabel>
        <Select
          labelId={`language-select-label-${index}`}
          id="language-select"
          name="language-select"
          label={index === 0 ? "Question language" : "Answer language"}
          value={selectedLanguages[index]}
          onChange={(e) => {
            const newSelectedLanguages = [...selectedLanguages];
            newSelectedLanguages[index] = e.target.value;
            setSelectedLanguages(newSelectedLanguages);
          }}
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
    <>
      <DropDownMenu index={0} />
      <DropDownMenu index={1} />
    </>
  );
};

export default SelectLanguagePair;
