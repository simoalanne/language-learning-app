import { Box, TextField, Typography, Slider, Button, CircularProgress } from "@mui/material";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ChipSelect from "./ChipSelect";
import LanguageFlag from "./LanguageFlag";

const WordGenerationForm = ({
  form,
  formConfig,
  onChange,
  onSubmit,
  loading
}) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>Generate Vocabulary</Typography>

    <TextField
      label="Topic"
      placeholder="Describe any topic you can think of (e.g., travel, food)"
      value={form.topic}
      onChange={(e) => onChange("topic", e.target.value)}
      fullWidth
      sx={{ mb: 2 }}
    />
    <TextField
      label="Skill Level"
      value={form.skillLevel}
      placeholder="Describe your skill level"
      onChange={(e) => onChange("skillLevel", e.target.value)}
      fullWidth
      sx={{ mb: 2 }}
    />
    <Typography gutterBottom>Amount of words to generate: {form.wordCount}</Typography>
    <Slider
      value={form.wordCount}
      onChange={(_, newValue) => onChange("wordCount", newValue)}
      min={1}
      max={formConfig.maxGeneratedWordsPerRequest}
      step={1}
      valueLabelDisplay="auto"
      sx={{ mb: 2 }}
    />
    <Typography gutterBottom>Specify word type(s) (optional):</Typography>
    <ChipSelect
      options={formConfig.wordTypes}
      selectedOptions={form.selectedWordTypes}
      setSelectedOptions={(val) => onChange("selectedWordTypes", val)}
      selectedColor="primary"
    />
    <Typography gutterBottom>Select languages to include (at least 2):</Typography>
    <ChipSelect
      minimumSelectedCount={2}
      options={formConfig.languageNames}
      icons={formConfig.languageNames.map((lang) => <LanguageFlag languageName={lang} />)}
      selectedOptions={form.languages}
      setSelectedOptions={(langs) => onChange("languages", langs)}
      selectedColor="secondary"
      boxSx={{ mb: 2 }}
    />
    <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={onSubmit} disabled={loading} endIcon={<AutoAwesomeIcon />}>
      Generate Words
    </Button>

    {loading && (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 1 }}>
        <Typography variant="body1">Letting the AI do its magic. This may take a while. Please wait...</Typography>
        <CircularProgress size={24} />
      </Box>
    )}
  </Box>
);

export default WordGenerationForm;
