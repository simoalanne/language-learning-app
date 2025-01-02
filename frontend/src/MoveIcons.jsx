import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import { Box, IconButton } from "@mui/material";

const MoveIcons = ({ currentIndex, maxIndex, onClick }) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", bgcolor: "", mt: 2 }}>
      <Box sx={{ display: "flex", gap: 1 }}>
        <IconButton
          onClick={() => onClick(0)}
          disabled={currentIndex === 0}
        >
          <FirstPageIcon />
        </IconButton>
        <IconButton
          onClick={() => onClick(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          <KeyboardArrowLeftIcon />
        </IconButton>
      </Box>
      <p style={{ margin: "auto 0", fontWeight: "bold" }}>
        {currentIndex + 1} / {maxIndex + 1}
      </p>
      <Box sx={{ display: "flex", gap: 1 }}>
        <IconButton
          onClick={() => onClick(currentIndex + 1)}
          disabled={currentIndex === maxIndex}
        >
          <KeyboardArrowRightIcon />
        </IconButton>
        <IconButton
          onClick={() => onClick(maxIndex)}
          disabled={currentIndex === maxIndex}
        >
          <LastPageIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default MoveIcons;
