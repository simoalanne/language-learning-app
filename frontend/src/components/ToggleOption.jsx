import {
  FormGroup,
  FormControlLabel,
  Checkbox,
  Tooltip,
  Switch,
} from "@mui/material";

const ToggleOption = ({
  value,
  setValue,
  label,
  tooltipTitle,
  tooltipPlacement,
  isSwitch = false,
}) => {
  // Tooltip handles missing title prop automatically by not rendering the tooltip
  return (
    <Tooltip title={tooltipTitle} placement={tooltipPlacement || "bottom"}>
      <FormGroup>
        <FormControlLabel
          control={
            isSwitch ? (
              <Switch
                checked={value}
                onChange={() => setValue(!value)}
                name={label}
              />
            ) : (
              <Checkbox
                checked={value}
                onChange={() => setValue(!value)}
                name={label}
              />
            )
          }
          label={label}
        />
      </FormGroup>
    </Tooltip>
  );
};

export default ToggleOption;
