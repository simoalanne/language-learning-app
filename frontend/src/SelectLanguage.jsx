import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";

const SelectLanguage = ({ languages, selectedLanguage, setSelectedLanguage, usedLanguages }) => {
  if (!selectedLanguage || languages.length === 0) return null; // data not loaded yet

  const shownLanguages = languages.filter((language) => !usedLanguages.includes(language));
  shownLanguages.push(selectedLanguage);
  shownLanguages.sort();
  
  return (
    // select is disabled when all languages are used as there is no language to select other than the current one
    <FormControl disabled={usedLanguages.length === languages.length} sx={{mt: 1 }} fullWidth>
      <InputLabel id="language-select-label">Select language</InputLabel>
      <Select
        labelId="language-select-label"
        id="language-select"
        value={selectedLanguage}
        label="Select language"
        onChange={(e) => setSelectedLanguage(e.target.value)}
      >
        {shownLanguages.map((language) => (
          <MenuItem key={language} value={language}>
            {language}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectLanguage;
