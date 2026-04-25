import {
  FormGroup,
  FormControlLabel,
  Checkbox,
  Tooltip,
  Switch,
} from "@mui/material";
import type { TooltipProps } from "@mui/material";

type ToggleOptionProps = {
  value: boolean;
  setValue: (value: boolean) => void;
  label?: string;
  tooltipTitle?: string;
  tooltipPlacement?: TooltipProps["placement"];
  isSwitch?: boolean;
};

const ToggleOption = ({
  value,
  setValue,
  label,
  tooltipTitle,
  tooltipPlacement,
  isSwitch = false,
}: ToggleOptionProps) => {
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
