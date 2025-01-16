import { Box } from "@mui/material";

/**
 * Aligns the content vertically and horizontally in the center of the screen.
 * accounting for the height of the AppBar.
 * @param {children} children - The content to be aligned.
 * @param {string} bgImage - The background image or gradient to be displayed.
 * @param {string} bgcolor - The background color to be displayed. will be overridden by bgImage.
 * @param {object} sx - Additional styles to be applied to the Box component or background.
 */
const ContentAligner = ({ children, background, bgcolor, sx }) => (
  <Box
    sx={{
      minHeight: "calc(100vh - 64px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background,
      bgcolor,
      ...sx,
    }}
  >
    {children}
  </Box>
);

export default ContentAligner;
