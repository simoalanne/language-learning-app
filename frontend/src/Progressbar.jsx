import { LinearProgress, Box, Tooltip } from "@mui/material";


const Progressbar = ({ total, completed, boxStyle, barStyle, tooltipTitle, tooltipPlacement }) => {
  let progress = (completed / total) * 100;

  // fixes an issue where progress starts from 100% and animates to 0% on first render
  if (!total) {
    progress = 0;
  }

  return (
    <Tooltip title={tooltipTitle} placement={tooltipPlacement}>
    <Box sx={boxStyle}>
      <LinearProgress variant="determinate" value={progress} sx={barStyle} />
    </Box>
    </Tooltip>
  );
}

export default Progressbar;