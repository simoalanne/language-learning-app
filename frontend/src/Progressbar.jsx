import { LinearProgress, Box, Tooltip } from "@mui/material";


const Progressbar = ({ total, completed, boxStyle, barStyle, tooltipTitle, tooltipPlacement }) => {
  const progress = (completed / total) * 100;
  return (
    <Tooltip title={tooltipTitle} placement={tooltipPlacement}>
    <Box sx={boxStyle}>
      <LinearProgress variant="determinate" value={progress} sx={barStyle} />
    </Box>
    </Tooltip>
  );
}

export default Progressbar;