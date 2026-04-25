import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";

/**
 * Reusable component for creating a select type of component using chips.
 * 
 * @param {Array<string>} options - Options to be displayed as chips.
 * @param {Array<string>} labels - Labels for the options. If not provided, options will be used as labels.
 * @param {Array<JSX.Element>} icons - Icons to be displayed on the chips. if not provided, no icons will be displayed.
 * @param {Boolean} iconsOnLeft - If true, icons will be displayed on the left side of the label.
 * @param {Array<string>} selectedOptions - Currently selected options.
 * @param {Function} setSelectedOptions - State setter for selected options.
 * @param {Boolean} allowMultiple - If true, multiple options can be selected. If false, only one option can be selected at a time.
 * @param {number} minimumSelectedCount - Minimum number of options that must be selected. If 0, no minimum is enforced.
 * @param {Object} boxSx - Additional styles for the Box component. optional.
 * @param {Object} chipSx - Additional styles for the Chip component. optional.
 * @param {Object} labelSx - Additional styles for the label inside the Chip component. optional.
 * @param {string} selectedColor - Color of the selected chip. optional.
 * @param {string} defaultColor - Color of the unselected chip. optional.
 */
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
}) => {
  const handleClick = (option) => {
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

  if (options.length === 0) return;

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
