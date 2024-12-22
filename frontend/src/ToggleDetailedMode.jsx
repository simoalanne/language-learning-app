import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { Tooltip } from '@mui/material';

const ToggleDetailedMode = ({ detailedMode, setDetailedMode }) => {
  return (
    <Tooltip title="With detailed mode enabled you can add tags to a translations as well as add more than two languages. You can also add synonyms to translations.">
    <FormGroup>
      <FormControlLabel
        control={
          <Checkbox
            checked={detailedMode}
            onChange={() => setDetailedMode(!detailedMode)}
            name="detailedMode"
          />
        }
        label="Detailed mode"
      />
    </FormGroup>
    </Tooltip>
  );
};

export default ToggleDetailedMode;