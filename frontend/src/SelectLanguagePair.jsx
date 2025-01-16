import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";

const SelectLanguagePair= ({
  languageNames = ["English", "Finnish", "French", "German", "Spanish", "Swedish"],
  selectedLanguages,
  setSelectedLanguages,
  labels = ["Question language", "Answer language"],
  allowSameLanguages = false,
}) => {
  if (languageNames.length === 0) return;
  const DropDownMenu = ({ index }) => {
    return (
      <FormControl fullWidth>
        <InputLabel id={`language-select-label-${index}`}>
          {index === 0 ? labels[0] : labels[1]}
        </InputLabel>
        <Select
          labelId={`language-select-label-${index}`}
          id="language-select"
          name="language-select"
          label={index === 0 ? labels[0] : labels[1]}
          value={selectedLanguages[index]}
          onChange={(e) => {
            const newSelectedLanguages = [...selectedLanguages];
            newSelectedLanguages[index] = e.target.value;
            setSelectedLanguages(newSelectedLanguages);
          }}
        >
          {languageNames
            .filter(
              (lang) => allowSameLanguages || !selectedLanguages[index === 0 ? 1 : 0].includes(lang)
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
