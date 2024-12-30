import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { Tooltip } from '@mui/material';

const ToggleOption = ({value, setValue, label, tooltipTitle, tooltipPlacement}) => {
  // Tooltip handles missing title prop automatically by not rendering the tooltip
  return (
    <Tooltip title={tooltipTitle} placement={tooltipPlacement || "bottom"}>
    <FormGroup>
      <FormControlLabel
        control={
          <Checkbox
            checked={value}
            onChange={() => setValue(!value)}
            name={label}
          />
        }
        label={label}
      />
    </FormGroup>
    </Tooltip>
  );
};

export default ToggleOption;