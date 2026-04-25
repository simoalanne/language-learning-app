import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import type { ChipProps, SxProps, Theme } from "@mui/material";
import type { ReactNode } from "react";

type ChipSelectProps = {
  options?: string[];
  labels?: string[];
  icons?: ReactNode[];
  iconsOnLeft?: boolean;
  selectedOptions?: string[];
  setSelectedOptions: (value: string[] | string) => void;
  allowMultiple?: boolean;
  minimumSelectedCount?: number;
  boxSx?: SxProps<Theme>;
  chipSx?: SxProps<Theme>;
  labelSx?: SxProps<Theme>;
  selectedColor?: ChipProps["color"];
  defaultColor?: ChipProps["color"];
};

const ChipSelect = ({
  options = [],
  labels = [],
  icons = [],
  iconsOnLeft = false,
  selectedOptions = [],
  setSelectedOptions,
  allowMultiple = true,
  minimumSelectedCount = 0,
  boxSx = {},
  chipSx = {},
  labelSx = {},
  selectedColor = "primary",
  defaultColor = "default",
}: ChipSelectProps) => {
  const handleClick = (option: string) => {
    if (allowMultiple) {
      if (selectedOptions.includes(option)) {
        if (minimumSelectedCount > 0 && selectedOptions.length <= minimumSelectedCount) {
          return;
        }
        setSelectedOptions(selectedOptions.filter((opt) => opt !== option));
      } else {
        setSelectedOptions([...selectedOptions, option]);
      }
    } else {
      // if only single selection is allowed options state should pass the selected option
      // as a string instead of an array
      setSelectedOptions(selectedOptions.includes(option) ? "" : option);
    }
  };

  if (options.length === 0) return null;

  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", ...boxSx }}>
      {options.map((option, i) => (
        <Chip
          sx={chipSx}
          key={option}
          label={
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: iconsOnLeft ? "row-reverse" : "row", gap: 1, ...labelSx }}>
              {labels[i] || option}
              {icons[i] && icons[i]}
            </Box>
          }
          onClick={() => handleClick(option)}
          clickable
          color={selectedOptions.includes(option) ? selectedColor : defaultColor}
          variant={selectedOptions.includes(option) ? "filled" : "outlined"}
        />
      ))}
    </Box>
  );
};

export default ChipSelect;
