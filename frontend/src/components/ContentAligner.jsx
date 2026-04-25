import { Box } from "@mui/material";

/**
 * Aligns the content vertically and horizontally in the center of the screen.
 * accounting for the height of the AppBar.
 * @param {children} children - The content to be aligned.
 * @param {Number} gap - The gap between the children elements.
 * @param {Boolean} centerVertically - If true, the content will be aligned vertically in the center.
 * @param {string} background - The background image or gradient to be displayed.
 * @param {string} bgcolor - The background color to be displayed. will be overridden by background if both are provided.
 * @param {object} sx - Additional styles to be applied to the Box component or background.
 */
const ContentAligner = ({ children, gap, centerVertically = true, background, bgcolor, sx }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      flexGrow: 1,
      alignItems: "center",
      justifyContent: centerVertically ? "center" : "flex-start",
      gap: gap || 0,
      background,
      bgcolor,
      ...sx,
    }}
  >
    {children}
  </Box>
);

export default ContentAligner;
